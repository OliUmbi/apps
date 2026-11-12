# CI/CD

GitHub Actions is the only build system. It verifies every change and publishes
immutable images; deployment stays a deliberate manual action.

Workflows live in `.github/workflows/`:

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `ci.yml` | every branch push (tags excluded), pull request, and called by publish | verify web, Java, image builds, deployment inputs and the report-only security scan |
| `publish.yml` | version tag `*.*`, or manual dispatch | re-run CI, build and push every image |
| `security.yml` | weekly schedule, manual dispatch | blocking secret, dependency and lockfile audit |

## `ci.yml`

| Job | Checks |
| --- | --- |
| `web` | PostgreSQL 18 service + Flyway migrate, `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm build` (five sites) |
| `java` | JDK 25, `services/mvnw -B -ntp -f services/pom.xml test` (includes Checkstyle) |
| `images` | build-only, same matrix as publish; no push. Catches Dockerfile, base-image, Caddy-plugin and Caddyfile breakage on pull requests |
| `deployment` | every Quadlet unit generates a `.service` under podman 5.8.9; every Ansible playbook passes `--syntax-check`; Prometheus, Alertmanager and blackbox configs validate |
| `security` | `gitleaks` over the checkout (a committed secret fails immediately) and a report-only `trivy fs` dependency scan |

Details that matter:

- The web job applies `database/migrations/` with the same Flyway major as
  production (`flyway/flyway:13.12.2-alpine`).
- `STUDIO_TEST_ADMIN_URL` points at the CI database, so the PostgreSQL-gated
  suites run. A guard step fails the job if any suite reports skipped.
- pnpm is pinned by `web/package.json`; Node is 26; Maven by the wrapper; JDK 25.
- Inputs are pinned: GitHub Actions by commit SHA, CI tool images
  (`postgres`, `flyway`, podman, Python, trivy, gitleaks) by `tag@digest`, and
  `ansible-core` by an exact version. Bump the tag and digest together.
- The security job is deliberately split: a secret is always blocking, while a
  new upstream CVE is reported on pull requests and becomes blocking in the
  weekly `security.yml` run, so a hotfix is never held hostage by an unrelated
  advisory. `infrastructure/.env.dev` is allowlisted in `.gitleaks.toml` as a
  committed dev placeholder, not a leak.
- The deployment job renders the Jinja placeholders before running the Quadlet
  generator, the same way the Ansible app role does. Unknown unit keys are
  silently dropped by podman, so key typos surface during server verification,
  not here.
- The dev compose rig is not part of CI. It is a workstation tool.

## `publish.yml`

A version tag (for example `2026.10.24`) starts a hard gate (`verify` calls
`ci.yml`) and then a matrix build. Nothing is pushed unless verification is
green.

Every image builds with the repository root as its context and the single root
`.dockerignore`:

| Image | Dockerfile |
| --- | --- |
| `apps-identity`, `apps-messaging`, `apps-assets` | `services/<name>/Dockerfile` |
| `apps-studio`, `apps-jublawoma`, `apps-unclet`, `apps-zelglihof`, `apps-oliumbi` | `web/sites/<name>/Dockerfile` |
| `apps-migrate` | `database/Dockerfile` |
| `apps-caddy` | `infrastructure/caddy/Dockerfile` |

Each push produces three tags:

- `:<version>` - the deployment source;
- `:sha-<sha>` - traceability;
- `:latest` - convenience only, never deployed.

The workflow uses GitHub Actions cache for layer reuse and `GITHUB_TOKEN` with
`packages: write` for ghcr. No other secret is needed to publish.

## Release flow

```text
merge to main
  → ci.yml green (including the build-only image job)
  → tag the commit with a version (e.g. 2026.10.24) and push the tag
  → publish.yml re-runs CI, builds and pushes all images
  → deploy from the workstation: deploy.yml -e image_tag=2026.10.24
  → migrate, provision database roles from the vault, then start the apps
  → verify, then record the release
```

`image_tag` is mandatory and `latest` is rejected. Rollback is the previous
tag. The step-by-step procedure is the
[release runbook](../operations/runbooks/release.md); the model is in
[deployment](../operations/deployment.md).

## Adding a site or a deployable

1. Add its Dockerfile and a matrix entry in both `publish.yml` and the CI
   `images` job.
2. Add a unit in `infrastructure/units/` (image pinned, health check, ordering).
   If it needs a database role, add it to `app_database_roles` so the deploy
   provisions login before the app starts.
3. Add the hostname to `infrastructure/caddy/Caddyfile`.
4. Add its environment template and vault keys in `ansible/`.
5. Add the migration schema and the app role.
6. Document the subsystem and update the repository map and operations pages.

## Current limits

- No end-to-end suite and no staging environment (deliberate at this scale).
- The 2026-11 [build and deployment review](../history/deployment-review-2026-11.md)
  found remaining deployment blockers; see
  [open work](../work/open-work.md#build-and-deployment-review-2026-11).
- Checkstyle runs as part of `mvn test`; the narrow Java persistence suites cover
  the JPA slice against the migrated schema, and broader HTTP+JPA integration is
  accepted post-launch ([TD-13](../work/tech-debt.md#td-13)).
- CI checks that units generate, not that their behavior is correct on the
  server. A deploy still verifies the running stack.
- The dev compose rig is not validated by CI; it is validated locally with
  `docker compose config`.
