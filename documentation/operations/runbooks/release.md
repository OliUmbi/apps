# Release

**When:** deploying a version tag to the production host, or rolling one back.
The release model and migration coupling are in [deployment](../deployment.md);
CI and image publishing are in [CI/CD](../../development/ci-cd.md).

## Before you start

1. **CI is green on the tag** and `publish.yml` pushed every image. Check the
   workflow run, not the image.
2. **The migration is compatible with the previous tag.** Rollback never runs a
   down-migration. Destructive changes are split into expand → backfill → verify
   → contract across releases.
3. **New environment variables have a vault key and a service template.** An
   env-only change needs no image rebuild, but it still needs a deploy.
4. **A recent backup exists and is pulled** when the release is risky. See
   [backup](backup.md).
5. **You know the current tag.** It is the rollback target.
6. **Edge changes have their inputs:** a new domain needs its DNS record and
   `dyndns_records` entry first; the Caddyfile is baked into the caddy image.

## Deploy

From `ansible/` on the workstation, connected over WireGuard:

```sh
ansible-playbook playbooks/deploy.yml -e image_tag=<tag>
```

The playbook renders units and env files, pulls images, starts postgres and the
one-shot migrate unit, provisions the database roles from the vault, and starts
the application units in dependency order (identity, messaging, assets → sites
and Studio → caddy → monitoring). Do not restart `apps-migrate` by hand; it
propagates a stop to the apps.

Record the tag and current migration head before you start, and keep the previous
tag until verification passes.

## Verify

Run every check before declaring the release done:

1. `ansible-playbook playbooks/status.yml` — all `apps-*` units active, timers
   enabled, disk normal, recent backup.
2. `ansible-playbook playbooks/logs.yml -e service=<name>` for any unit that is
   not healthy; check the migrate log first.
3. Public smoke test: each site's home page, one content page, one image, and the
   Studio sign-in page over HTTPS.
4. Studio sign-in and one authorized read (for example a content list) to prove
   identity, assets and the session path.
5. One durable write on the changed workflow, if the release touched a form:
   submit, confirm the row and the queued email, then remove test data outside
   production.
6. The session cookie is `__Host-studio_session` with `Secure`, `HttpOnly` and
   `SameSite=Lax`; the baseline CSP and the other security headers are present
   ([edge checks](security.md#edge-checks)).
7. The public limit returns 429 above 20 events in two seconds, and
   `/api/session/login` is limited to 10 per minute.
8. The alert channel is quiet, probes recover, and certificates are valid if the
   release touched Caddy or DNS.
9. If the release touched backup or housekeeping, run it once
   (`backup.yml` / `housekeep.yml`) and confirm its success metric.

Record the result in the [release log](../releases.md): date, tag, source commit,
migration version, verifier, result, rollback target and notes.

## Roll back

```sh
ansible-playbook playbooks/deploy.yml -e image_tag=<previous-tag>
```

Roll back before investigating when a primary route, form, authorization, admin
workflow or TLS is broken. The previous tag must be schema-compatible; if a
migration made it unsafe, fix forward instead. Record the rollback as a new row
in the release log.

## Failed deploy or migration

| Symptom | First action |
| --- | --- |
| Unit failed or restart-looping | Read its log; check the migrate log and the rendered env file |
| Migration failed | Do not start the apps. Read the statement, decide fix-forward or previous tag; if data changed incompatibly, restore into a separate database and validate before switching |
| Site up, content wrong | Check the tag and the site data; do not edit the database to compensate |
| Certificate or routing failure | Check caddy logs and DNS ([edge](edge.md)) |
| Host or disk problem | `status.yml`, then [incidents](incidents.md) |

## Done when

- Every check above passed and the release log row exists.
- The previous tag is recorded as the rollback target.
- Any follow-up (a new alert, a data fix, a doc correction) is in
  [open work](../../work/open-work.md) or [technical debt](../../work/tech-debt.md).
