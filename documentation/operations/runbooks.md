# Runbooks

Concise procedures for common tasks and failures. Detailed procedures live on
the linked page; a runbook only tells you where to start, what to validate and
when to stop.

Every destructive command verifies its target first. When recovery and diagnosis
conflict, restore service first and investigate afterwards.

## Deploy and verify

**Use when** releasing a version tag.

1. Confirm CI is green on the tag and the migration is compatible with the
   previous tag.
2. Record the current tag.
3. `ansible-playbook playbooks/deploy.yml -e image_tag=<tag>` from `ansible/`.
4. Run the verification checklist in [deployment](deployment.md#verify-after-deploying).

**Stop if** a unit is failed, a probe stays red, or a durable write cannot be
confirmed. Roll back before investigating a schema-compatible release.

## Roll back

**Use when** a release broke a primary route, a form, authorization, TLS or the
admin workflow.

1. `ansible-playbook playbooks/deploy.yml -e image_tag=<previous-tag>`.
2. Verify with the same checklist.
3. Do not reverse a migration; the previous tag must be schema-compatible.
4. Record the rollback and keep the failed tag for diagnosis.

See [deployment](deployment.md#rollback).

## Failed migration

**Symptom** `apps-migrate` failed; application units are stopped or cannot start.

1. Read the migrate unit log:
   `ansible-playbook playbooks/logs.yml -e service=migrate`.
2. Identify the failing statement and whether it committed. Flyway records
   history; do not edit the schema by hand without understanding the version.
3. Prefer fixing forward with a new migration and redeploying.
4. If the release must be abandoned, roll back to the previous tag. If the
   migration already changed data incompatibly, restore from the last verified
   backup into a separate database first, validate, then plan the switch.
5. Start the application units only after the schema and code agree.

## Restore

**Use when** data is lost or corrupt, or a restore drill is due.

Follow [backup and restore](backup-restore.md#restore-untested-until-the-drill).
The procedure is not yet exercised on a dedicated machine; treat it as a draft
until the drill passes. Never start the application units against a partial
database.

## Rotate a secret

**Use when** a credential leaked, a provider rotated it, or the quarterly review
reaches it.

1. Update the vault key.
2. Update the service template if the variable is new.
3. Deploy the current tag (env-only change; no image rebuild).
4. Verify the service starts and its health check passes.
5. Revoke the old credential at the provider or database.
6. Record the rotation date.

See [access and security](access-and-security.md#rotating-a-secret).

## Editor account lifecycle

**Create** through Studio account administration (or the identity account API
with the internal token). Grant `studio.admin` or `<site>.manage` explicitly.

**Change role** by updating permissions; verify the editor loses the old site
immediately (server-side check, not just the UI).

**Disable or remove** by disabling the account, which revokes sessions, then
deleting it when retention allows. Never share an account between people.

## Missing message

**Symptom** a form was accepted but no email arrived.

1. Check Studio delivery history for the site and time window, and
   `GET /message/{id}` if the id is known.
2. If a delivery row exists, read its attempts: `SENT`, `RETRY`, `FAILED` or
   `REJECTED` with a structured detail.
3. If no row exists, the producer transaction did not commit the queue insert.
   Check the site logs and the form's durable row. A committed form with no queue
   row is a bug, not a mail problem.
4. For `FAILED`, inspect the SMTP detail (configuration, auth, recipient). There
   is no admin retry endpoint yet; a controlled re-queue uses the original
   request UUID.
5. Never resend blindly: an `UNKNOWN`/ambiguous send may already have reached the
   recipient.

## Site unavailable

**Symptom** `SiteProbeFailing`, a browser error, or a timeout.

1. Check the caddy unit and the site unit:
   `status.yml`, then `logs.yml -e service=<site>`.
2. If caddy is down, HTTP and TLS fail for every site. Restart caddy and read its
   logs.
3. If one site is down, restart that site unit; if it loops, read the first
   error and check the last deploy tag.
4. If postgres is down, sites fail together; see the postgres alert.
5. If the host is unreachable, use physical recovery; the tunnel and monitoring
   are also down.

## Disk filling up

1. `status.yml` and `df -h /`.
2. Run `playbooks/housekeep.yml`.
3. Find the large directory: images, journald, postgres or media. Do not delete
   durable state to make room.
4. If the backup directory is large, verify the workstation pull first, then
   reduce the server retention deliberately.
5. Record why it filled; a recurring cause is a missing rotation or an oversized
   upload.

## Postgres not answering

1. Check the `apps-postgres` unit and disk.
2. Read its log. A data-directory permission or disk-full error is not fixed by
   restarting.
3. If it restarts cleanly, verify a read and a write, then every site.
4. If data is corrupt, stop and restore into a separate database before switching
   traffic.

## TLS or certificate problem

1. Read caddy logs. Distinguish ACME/DNS failure from a serving problem.
2. Verify the Infomaniak token and the DNS records (`dyndns` timer logs).
3. Do not delete `/var/lib/apps/caddy-data`: it holds the ACME account and
   certificates, and re-issuing hits rate limits.
4. After a fix, confirm the certificate chain and expiry with an HTTPS probe.

## Add or change a domain

1. Create the DNS record once in the Infomaniak manager and add it to
   `dyndns_records`.
2. Add the route or redirect to `infrastructure/caddy/Caddyfile`.
3. Publish an image tag (the Caddyfile is baked into the caddy image) and deploy.
4. Verify DNS, certificate issuance, redirects and the site.
5. The old `api.*` names are retired: do not add redirects, delete the records.

## Delete personal data or an asset

1. Identify the owner table and the retention rule; there is no generic delete
   button for every domain.
2. Use the owning service/Studio operation where one exists. Do not run ad hoc
   `DELETE` on production without a reviewed statement and a backup.
3. For an asset, use the assets deletion path so metadata and files stay
   consistent; failed file removal is cleaned up later.
4. Record what was deleted, why, and the legal basis/retention decision.
5. Confirm the data is gone from backups on their own retention schedule; do not
   promise immediate removal from archives.

## Decommission the legacy stack

After cutover is accepted:

1. Keep the final encrypted archives and confirm they restore.
2. Remove DNS records, credentials, containers, volumes and scheduled jobs.
3. Remove `legacy/` only when its useful knowledge lives in the maintained docs.
4. Record the retention dates and the observation window.

See [migration](../work/migration.md).

## Cutover

The legacy cutover has its own sequence (freeze, final export, reconcile, deploy,
switch routing, verify, observe). Follow
[migration](../work/migration.md#cutover-playbook); do not improvise it during a
deploy window.
