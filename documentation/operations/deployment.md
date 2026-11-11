# Deployment model

> **Current readiness (2026-11):** the
> [build and deployment review](../history/deployment-review-2026-11.md) found
> P1 blockers in role provisioning, monitoring permissions, the deploy tag and
> DNS. The code is complete; the remaining work is real-host verification. Do not
> treat the deploy path as accepted until those checks and the restore drill have
> evidence.

The release model is deliberately boring: CI builds immutable images on a
version tag, and the maintainer deploys that tag with one command. Rollback is
the same command with the previous tag.

**Procedure:** [release runbook](runbooks/release.md). This page owns the model
and the policies the procedure depends on.

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
postgres → migrate → roles → services/sites → caddy → monitoring
```

`latest` is published for convenience but rejected by the deploy path. Every
unit pins an immutable tag, and the app role asserts that `image_tag` is present
and not `latest`. The last week of images stays on the server as rollback
candidates; the last few tags stay in ghcr.

## Migration coupling

Migrations are a one-shot `apps-migrate` unit and the application units
`Require` it, so migrations always run before the code that needs them. Role
provisioning runs after migrate and before the apps, so a fresh host becomes
healthy on the first deploy. Do not restart `apps-migrate` by hand: a manual
restart propagates a stop to the apps.

The pre-launch baseline head is V011 (V007 intentionally unused; V008 Jublawoma,
V009 Uncle-T, V010 Zelglihof and V011 analytics; the monitoring role is in
V001). Until the
first accepted production import, migrations are edited in place and the local
database is rebuilt. After the freeze, new changes are append-only:
expand → backfill → verify → contract across releases. Rollback never runs a
down-migration, so the previous tag must be schema-compatible; that is why
destructive changes are split across releases.

## Rollback policy

Rollback is the previous tag, deployed with the same command. It restores the
previous application code and restart order; it does not reverse migrations.

Rollback triggers are objective: inaccessible primary routes, lost or corrupt
submissions, unsafe authorization, a broken admin workflow, invalid TLS, or an
error rate above the agreed threshold. When in doubt, restore service first and
investigate afterwards. Record the rollback as a new row in the
[release log](releases.md).

## First-time server setup

A new machine is built with `playbooks/site.yml`. The full sequence (router, DNS,
vault, WireGuard, verification, SSH lockdown) is the
[setup runbook](runbooks/setup.md). Three details are part of the release
contract:

- `image_tag` is required; `latest` is rejected.
- Live dyndns stays disabled until cutover; pass `-e dyndns_enabled=true` only in
  the cutover run.
- After the stack is healthy, run `playbooks/first-admin.yml --ask-vault-pass`
  once. Credentials come from `vault_first_admin_*`, never from a migration.

## Related

- [Release runbook](runbooks/release.md) - the deploy, verification and rollback
  steps.
- [Release log](releases.md) - what is actually running.
- [Incidents](runbooks/incidents.md) - a failed deploy, migration or site.
- [CI/CD](../development/ci-cd.md) - what runs before an image exists.
- [Backup and restore](backup-restore.md) - the safety net a deploy relies on.
- [Migration](../work/migration.md) - the legacy cutover, which has its own
  playbook.
