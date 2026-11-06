# Verification

Every task ends with the checks that cover what it touched. CI runs the same
commands, so a green local run and a green CI run mean the same thing.

## The gate by change type

| You changed | Run |
| --- | --- |
| `web/**` | `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm build` from `web/` |
| any `web/packages/*` | the above **plus** `pnpm --filter studio build` |
| `services/**` | `services\mvnw.cmd -f services/pom.xml test` from the repository root |
| `database/migrations/**` | apply migrations to a fresh local database, then the web and service suites that touch the model |
| `infrastructure/compose.dev.yaml` | `docker compose -f infrastructure/compose.dev.yaml config` |
| `infrastructure/units/**` or `ansible/**` | CI generates the units and syntax-checks the playbooks; verify on the rebuilt server before trusting a deploy |
| `documentation/**` | read the affected page, check links, and confirm the fact has one owner |

## Web

From `web/`:

```powershell
pnpm check       # Biome style/lint - must be exit 0
pnpm typecheck   # runs pnpm generate first; fails on a stale route tree
pnpm test        # node:test suite (tsx)
pnpm build       # all four sites, serialized
pnpm --filter studio build   # REQUIRED after any web/packages/* change
```

What they mean:

- `check` is Biome formatting and lint over sources and maintained config. At the
  workspace root, `check` is Biome; inside a package, `check` means `tsc --noEmit`
  and is collected by `typecheck`. `pnpm fix` writes Biome fixes.
- `typecheck` runs `pnpm generate` (the single owner of the Paraglide output),
  then `tsc` per package/site and the tests project.
- `test` is the `node:test` suite. Two suites are PostgreSQL-gated and skip
  silently when `STUDIO_TEST_ADMIN_URL` is unset. CI points it at a migrated
  database and fails if anything skips; locally, set it if you touched a
  repository or workflow.
- `build` builds all four sites. Studio is the broadest consumer of shared
  packages, which is why it has its own required build.

## Java services

From the repository root:

```powershell
services\mvnw.cmd -f services/pom.xml test
```

From `services/`, `./mvnw test` or `mvn test` is equivalent. The wrapper pins
Maven 3.9.12, the same version CI uses. The suites run without a database or SMTP
server.

Java integration tests against a real PostgreSQL and a Java style check are still
follow-ups ([TD-13](../work/tech-debt.md#td-13)).

## Database

CI applies `database/migrations/` in order to a fresh PostgreSQL 18 for the web
suite. Integration tests run against a real PostgreSQL: empty-database
migration, constraints, authorization at server boundaries, queue creation
alongside the domain write, and duplicate submissions. Tests never send live
email or touch production. Locally:

1. recreate the database (`down -v`, then `up -d --build` with the dev compose
   stack), or apply the migrations to a fresh database;
2. run the PG-gated suites with `STUDIO_TEST_ADMIN_URL` set;
3. if a migration changed, verify the constraint and status tables in
   [database/README.md](../../database/README.md) still match.

## Infrastructure and deployment inputs

The dev compose rig is a workstation tool; CI deliberately does not depend on it.
After a compose change:

```powershell
docker compose -f infrastructure/compose.dev.yaml config
```

The unit files and playbooks are checked in CI, not locally:

- every `infrastructure/units/*.container` must generate a `.service` under the
  podman 5.x Quadlet generator;
- every `ansible/playbooks/*.yml` must pass `ansible-playbook --syntax-check`.

Unit behavior is verified on the rebuilt server, because the workstation cannot
run the generator the same way.

## PowerShell caveat

Piping a native command with `2>&1 |` marks the pipeline failed even when the
command succeeded. Judge success by the output or `$LASTEXITCODE` after an
unpiped run, not by the harness exit code of a pipe.

## What is not covered

- Staging environments and end-to-end browser suites are deliberately deferred
  at this scale.
- SMTP delivery and the complete deployed stack need an environment integration
  pass.
- A restore is verified by the drill, not by a unit test; the drill is pending.

CI parity and workflow details: [CI/CD](ci-cd.md).
