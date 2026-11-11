# Restore, drill and PostgreSQL major upgrade

**When:** data is lost or corrupt, a restore drill is due, or PostgreSQL moves to
a new major version. Policy and archive contents are in
[backup and restore](../backup-restore.md).

> **Read first.** The from-zero restore has not been exercised yet. Treat this as
> a drill draft until [drill acceptance](#drill-acceptance) passes. Never restore
> under live writes, and never start the application units against a partial
> database. There is no restore playbook; this is a manual procedure.

## Prerequisites

- A pulled archive and the recovery identity (the printed sheet works).
- A target host with podman, WireGuard and the units installed by `site.yml`,
  but **not** serving traffic. The preferred target is the not-yet-live
  replacement host while legacy remains live.
- The image tag recorded in `manifest.txt`.
- `apps-backup.timer` disabled so a scheduled run cannot collide with the
  restore.

## Restore

1. **Decrypt and verify on the workstation.**

   ```sh
   age -d -i backup-identity.age apps-<stamp>.tar.gz.age > apps-<stamp>.tar.gz
   tar xzf apps-<stamp>.tar.gz
   sha256sum -c SHA256SUMS
   ```

   The identity is passphrase-protected; `age` prompts once. The manifest uses
   relative names, so verification works in the extraction directory on any
   machine. Stop if a checksum fails.

2. **Stop everything except PostgreSQL.** The extraction directory contains role
   password hashes; treat it as secret. Disable the backup timer first.

   ```sh
   systemctl disable --now apps-backup.timer
   systemctl stop apps-caddy apps-studio apps-jublawoma apps-unclet apps-zelglihof
   systemctl stop apps-oliumbi apps-identity apps-messaging apps-assets
   systemctl start apps-postgres
   ```

3. **Restore roles and database.** The globals file recreates the application
   roles and their password hashes, so treat the extraction directory as secret.
   Use the container's configured `POSTGRES_USER` (the example vault uses
   `apps_migrator`, not `postgres`).

   ```sh
   podman exec -i postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f -' < globals.sql
   podman exec -i postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists' < database.dump
   ```

   If the database does not exist, create it with the configured owner first.
   Verify the expected schemas and row counts before continuing.

   > **Known draft gap:** a host built by `site.yml` already has the roles from
   > V001, so `globals.sql` hits `CREATE ROLE ... already exists` and the stored
   > passwords do not apply. Either reconcile roles and passwords from the vault
   > with the normal deploy provisioning, or restore into a clean cluster. Settle
   > the order during the drill.

4. **Restore media.**

   ```sh
   tar xzf media.tgz -C /var/lib/apps/media
   chown -R 100:100 /var/lib/apps/media   # assets image uid/gid
   ```

5. **Start the recorded tag.** The deploy re-provisions role passwords from the
   vault and runs the migrate unit; confirm Flyway reports the expected head
   (`logs.yml -e service=migrate`).

   ```sh
   cd ansible
   ansible-playbook playbooks/deploy.yml -e image_tag=<manifest-tag>
   ```

6. **Verify.** Run the [release verification](release.md#verify). Confirm Caddy
   re-issued or still holds valid certificates and take a fresh backup.

7. **Record and re-enable.** Keep row counts, media samples, timings,
   certificate re-issuance and every deviation. Re-enable the timer with
   `systemctl enable --now apps-backup.timer` only after the result is known.

## Drill acceptance

The drill passes when all of these are true on a from-zero host:

- Every row count matches the source within the expected difference, and a media
  sample hashes identically.
- Every site and Studio work, including one image and one durable write.
- The first admin can sign in, or the drill host's admin path is documented.
- Caddy re-issued certificates through DNS-01 without touching rate limits.
- A fresh backup from the restored host is pulled and verifies.
- The deviations are fixed in this runbook, and the open-work drill item is
  closed with the evidence.

## PostgreSQL major upgrade

Images stay pinned; a major upgrade is a planned dump/restore, not an image pull.
Keep the old data directory until the new cluster is accepted.

1. **Before the window:** take a backup, pull it, verify `sha256sum -c`, record
   row counts and role names, and disable `apps-backup.timer`.
2. **Stop writers:** stop every application unit, Caddy and the postgres unit.
3. **Dump from the old cluster:**

   ```sh
   podman exec postgres sh -c 'pg_dumpall -U "$POSTGRES_USER" --globals-only' > globals.sql
   podman exec postgres sh -c 'pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB"' > database.dump
   podman exec postgres postgres --version
   ```

4. **Switch the data directory:** move `/var/lib/apps/postgres` to
   `/var/lib/apps/postgres-<oldmajor>` (keep it), create a fresh
   `/var/lib/apps/postgres` owned `70:70`, and update the postgres image to the
   new `tag@digest` in `infrastructure/units/apps-postgres.container`.
5. **Start the new major alone.** The entrypoint initializes a fresh cluster.
   Restore globals (the new superuser already exists; do not overwrite it
   blindly), then `pg_restore`. Missing extensions fail here, not after traffic
   returns.
6. **Reconcile credentials:** provision the role passwords from the vault, run
   `apps-migrate`, and confirm the Flyway head.
7. **Verify and re-enable:** start the stack, walk every site and Studio, check a
   durable write, take and pull a fresh backup, re-enable `apps-backup.timer`.
8. Delete `/var/lib/apps/postgres-<oldmajor>` only after the new cluster is
   accepted and a fresh archive restores elsewhere.

## If it fails

- **Restore failed:** destroy the replica and start again from the archive. Do
  not start the applications against a partial database.
- **Role mismatch:** reconcile from the vault with the normal deploy
  provisioning; never leave the apps running on mismatched roles.
- **Certificate failure:** follow [edge](edge.md#certificate-re-issuance); do not
  restart Caddy in a loop.
- **Archive corrupt:** use an older copy; investigate before trusting the next
  run.

## Done when

- The data is back and verified, or the drill acceptance above passed.
- A fresh backup from the restored host exists and is pulled.
- The old data directory is kept until the new cluster is accepted.
- The result and any runbook changes are recorded, and the matching open-work
  item is closed.
