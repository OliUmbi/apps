# Deployment

> **Current readiness (2026-11):** the
> [build and deployment review](../history/deployment-review-2026-11.md) found
> P1 blockers in database role provisioning, monitoring permissions, the deploy
> tag default and DNS. The code is complete in the 2026-11 pass; the remaining
> work is real-host verification. Do not treat the deploy path as accepted until
> those checks and the restore drill have evidence.

The release model is deliberately boring: CI builds immutable images on a
version tag, and the maintainer deploys that tag with one command. Rollback is
the same command with the previous tag.

This page owns the deploy procedure. CI itself is documented in
[development/ci-cd.md](../development/ci-cd.md); the server units are in
`infrastructure/units/` and [infrastructure/README.md](../../infrastructure/README.md).

## Release model

```text
change lands on main
      │
      ▼
CI (ci.yml): web checks, Java tests, deployment-input checks
             + a no-push build of every image (DR-13)
      │
      ▼
version tag (e.g. 2026.10.24)
      │
      ▼
publish.yml: re-runs CI, builds every image, pushes
             ghcr.io/oliumbi/apps-*:<tag>, :sha-<sha>, :latest
      │
      ▼
ansible-playbook playbooks/deploy.yml -e image_tag=2026.10.24
      │
      ▼
render units with the tag → pull → restart in order
postgres → migrate → roles → services/sites → caddy
```

`latest` is published for convenience but is rejected by the deploy path.
Every unit pins an immutable tag, and the app role asserts that `image_tag` is
present and not `latest`. The last week of images stays on the server as
rollback candidates; the last few tags stay in ghcr.

## Before deploying

1. **CI is green on the tag.** `publish.yml` calls `ci.yml` as a hard gate, so a
   pushed image already passed web checks, Java tests, deployment-input checks
   and the no-push image build. If you are unsure, check the workflow run, not
   the image.
2. **The migration is compatible with the previous application tag.** Rollback
   deploys the previous tag; it never runs a down-migration. A destructive
   schema change must follow expand → backfill → verify → contract across
   releases. The current pre-launch baseline head is V012 (V007 Jublawoma,
   V008 Uncle-T and V009 Zelglihof, then V010 audit, V011 analytics and V012
   monitoring role).
3. **Secrets are in the vault.** A new environment variable needs a vault key and
   the per-service template before the deploy that reads it. Production roles are
   provisioned from the vault after migrate; `STUDIO_SECURE_COOKIES=true` is in
   the Studio unit.
4. **DNS is ready.** Every `studio.*`/`admin.*` name is in `dyndns_records` and
   created once in Infomaniak. On a parallel host the dyndns timer stays disabled
   (the default) until cutover.
5. **You know the current tag.** Record it before deploying. This is the rollback
   target. Never pass `latest`: it is rejected.

## Deploy

From `ansible/` on the workstation, connected over WireGuard:

```sh
ansible-playbook playbooks/deploy.yml -e image_tag=<tag>
```

The playbook:

1. renders `infrastructure/units/` with `{{ image_tag }}` and the monitoring bind
   address into `/etc/containers/systemd/`;
2. renders the per-service `/etc/default/apps-*` environment files (secret
   templates run with `no_log`);
3. reloads systemd and pulls every image referenced by the units;
4. starts postgres and the one-shot migrate unit, then provisions each
   application database role from the vault and checks that it can log in;
5. starts the application units in dependency order: identity, messaging, assets
   → sites (including the static Oliumbi placeholder) and Studio → caddy, then
   the monitoring units.

Migrations are a one-shot `apps-migrate` unit. The application units `Require`
it, so migrations always run before the code that needs them. Role provisioning
runs after migrate and before the apps, so a fresh host becomes healthy on the
first deploy. Do not restart `apps-migrate` by hand: a manual restart propagates
a stop to the apps. Use the deploy playbook instead.

The first administrator is not a migration seed. After the stack is healthy, run
the one-time playbook once:

```sh
ansible-playbook playbooks/first-admin.yml --ask-vault-pass
```

It creates the account through identity's authenticated internal endpoint and
grants `studio.admin`; it fails rather than duplicating an existing account.

## Verify after deploying

Run these before declaring the deploy done:

1. `ansible-playbook playbooks/status.yml` - every `apps-*` unit active, timers
   enabled, disk normal, recent backup.
2. `ansible-playbook playbooks/logs.yml -e service=<name>` for any unit that is
   not healthy. Check migration logs first if an app failed to start.
3. Public smoke test: load each site's home page, one content page, one image and
   the Studio sign-in page over HTTPS.
4. Studio sign-in and one authorized read (for example a content list) confirm
   identity, assets and the session cookie path.
5. One durable write on the changed workflow, if the release touched a form:
   submit, confirm the durable row and the queued email, then clean up test data
   if the environment is not production.
6. Confirm the session cookie is `__Host-studio_session` with `Secure`,
   `HttpOnly` and `SameSite=Lax` over HTTPS, and that the baseline CSP header is
   present.
7. Burst the public limit (>20 requests in 2s) and confirm a 429; confirm login
   is limited to 10/min.
8. Check the alert channel is quiet and the blackbox probes recover. If the
   release touched Caddy or DNS, confirm certificate issuance or re-issuance.

A release is not done until the verification result is known. Record source
revision, image tag, migration version and verification result in the
[release log](releases.md).

## Rollback

```sh
ansible-playbook playbooks/deploy.yml -e image_tag=<previous-tag>
```

Rollback redeploys the previous application tag and the units restart in the same
order. It does not reverse migrations. If the failed release included a
destructive migration, the previous tag must still be schema-compatible; that is
why destructive changes are split across releases.

Rollback triggers are objective: inaccessible primary routes, lost or corrupt
submissions, unsafe authorization, a broken admin workflow, invalid TLS, or an
error rate above the agreed threshold. When in doubt, restore service first and
investigate afterwards.

## If the deploy fails

| Symptom | First action |
| --- | --- |
| A unit is failed or restart-looping | `logs.yml` for that unit; check migrate logs and the environment file |
| Migration failed | do not start the apps; fix forward or roll back to the previous tag; see [runbooks](runbooks.md) |
| Site is up but content is wrong | check the tag, then the site's data and cache behavior; do not edit the database to compensate |
| Certificate or routing failure | check caddy logs and DNS; see [edge](../architecture/subsystems/edge.md) |
| Host or disk problem | `status.yml`; follow [runbooks](runbooks.md) |

## First-time server setup

A new machine is built with `playbooks/site.yml`; the full sequence (router,
DNS, vault, WireGuard, verification, SSH lockdown) is in
[access and security](access-and-security.md). Three details are part of the
release contract:

- `image_tag` is required, for example
  `ansible-playbook playbooks/site.yml -e image_tag=2026.10.24`; `latest` is
  rejected.
- Live dyndns stays disabled until cutover. Pass `-e dyndns_enabled=true` only
  in the cutover run.
- After the stack is healthy, run `playbooks/first-admin.yml --ask-vault-pass`
  once. Credentials come from `vault_first_admin_*`, never from a migration.

## Related

- [Release log](releases.md) - the record of what is actually running.
- [CI/CD](../development/ci-cd.md) - what runs before an image exists.
- [Backup and restore](backup-restore.md) - the safety net a deploy relies on.
- [Runbooks](runbooks.md) - failed migration, rollback and recovery procedures.
- [Migration](../work/migration.md) - the legacy cutover, which has its own
  playbook.
