# Backup and restore

A backup that was never restored is a hypothesis, not a backup. The nightly
pipeline is automated, fail-closed and monitored; the restore drill is still
pending because it needs a dedicated machine.

## What is backed up

Nightly at 03:00 by default (`apps-backup.timer`, templated from `backup_hour`;
script `ansible/files/backup.sh`):

1. `pg_dump -Fc` of the application database;
2. `pg_dumpall --globals-only` (the roles live there);
3. a `tar.gz` of `/var/lib/apps/media` (uploads);
4. a `manifest.txt` with the date, postgres version and running image tags;
5. `SHA256SUMS` over the archive contents, written with relative names.

The whole set is packed into one `age`-encrypted archive,
`/var/backups/apps/apps-<UTC-stamp>.tar.gz.age`. The server keeps three copies.

The pipeline fails closed: the media tar and the outer archive are written to
files, and the outer archive is verified with `tar tzf` before encryption; `age`
writes a temporary file that is renamed only after it succeeds; and the freshness
metric is written last. A failed stage leaves no new archive and no success
metric.

The backup does **not** include monitoring state (deliberately, D12), the
Ansible vault, or Caddy's ACME state. Certificates are re-issued rather than
copied (D21); see below.

## Key handling (once, then treat it as done)

The server only ever holds the **public** recipient in the vault
(`vault_age_recipient`); it cannot decrypt its own archives. The private
identity is passphrase-wrapped, stored in the password manager and printed on a
single recovery sheet. `age` decrypts a passphrase-protected identity file
automatically when it is passed with `-i`, so recovery stays two commands.

On the workstation:

```sh
age-keygen -o backup-identity.txt                 # prints the public age1... key
age -p -a -o backup-identity.age backup-identity.txt   # 6-word passphrase
rm backup-identity.txt                            # no plaintext key remains
```

1. Put the printed public key (`age1...`) in the vault as `vault_age_recipient`.
2. Put `backup-identity.age` (ASCII-armored) in the password manager.
3. Print the same armored block plus the passphrase and the two commands on the
   recovery sheet. Store it where a second person could find it if the
   maintainer is unavailable; that is the actual bus-factor fix.
4. Test the sheet once during the restore drill, not the password manager copy.

Losing the identity is losing every archive; losing only the workstation is
recoverable from the sheet. Replacing the key means: generate a new identity,
update `vault_age_recipient`, take a fresh archive, and keep the old sheet until
the old archives are outside the retention window.

## Caddy ACME state and re-issuance

`/var/lib/apps/caddy-data` and `caddy-config` (the ACME account and issued
certificates) are excluded from the archive on purpose
([TD-16](../work/tech-debt.md#td-16)). A rebuilt host re-issues through DNS-01.

The inputs live in the vault and are rendered into `/etc/default/apps-caddy`:

- `vault_acme_email` (`ACME_EMAIL`);
- `vault_infomaniak_api_token` (`INFOMANIAK_API_TOKEN`, scopes `domain:read`,
  `dns:read`, `dns:write`).

To re-issue on a rebuilt host:

1. Confirm both values are present in the vault and readable by the caddy unit.
   The Caddyfile is baked into the pinned caddy image, so no config edit is
   needed.
2. Start `apps-caddy` and watch its ACME/DNS-01 log:
   `ansible-playbook playbooks/logs.yml -e service=caddy`.
3. Confirm issuance with an HTTPS probe and with
   `probe_ssl_earliest_cert_expiry` / the `CertificateExpiringSoon` alert.
4. Respect Let's Encrypt rate limits: do not repeatedly restart or re-create
   the container while issuance is in flight. If the duplicate-certificate limit
   is reached, stop and wait for the window; repeated failures are a DNS/token
   problem, not a reason to retry faster.
5. Record the re-issuance in the restore report. The restore drill must exercise
   this path, not only a database restore.

Never delete `/var/lib/apps/caddy-data` on a running host to "refresh" a
certificate: it holds the ACME account and the current certificates.

## Pull to the workstation

The workstation pulls the archives over WireGuard; the server holds no
credentials for the workstation.

```powershell
# Windows
.\ansible\files\pull-backups.ps1
```

```sh
# WSL / Git Bash
./ansible/files/pull-backups.sh
```

Both keep seven local copies and warn when the newest is more than a day old.
Schedule the Windows script in Task Scheduler or run it manually after a deploy.

## Freshness and verification

`backup.sh` writes two metrics for the node-exporter textfile collector:

- `apps_backup_last_success_timestamp_seconds`
- `apps_backup_size_bytes`

The textfile is written to a temporary path and renamed atomically, after every
backup stage succeeded. `BackupStale` fires when the metric is **absent** as well
as when it is older than 36 hours (RV-02). The pull script warns locally when the
newest copy is stale. The metrics prove the job ran and the archive exists; they
do not prove it restores.

## Restore (untested until the drill)

The workstation drill was retired with the old compose files (D14). The intended
procedure rebuilds a dedicated machine from zero and restores a pulled archive.
**It is not yet exercised; treat it as a runbook draft until the drill passes.**
Restore is still manual: no restore playbook exists yet.

On the new machine, after `playbooks/site.yml` has installed podman and the
units (but before the application units matter):

1. **Prepare the archive on the workstation.**

   ```sh
   age -d -i backup-identity.age apps-<stamp>.tar.gz.age > apps-<stamp>.tar.gz
   tar xzf apps-<stamp>.tar.gz
   sha256sum -c SHA256SUMS
   ```

   The identity file is passphrase-protected; `age` prompts once. If the
   workstation copy is gone, the printed recovery sheet is the input.

   The manifest uses relative names, so verification works in the extraction
   directory on any machine (TD-17 is fixed). If any checksum fails, stop: do not
   restore a corrupt archive.

2. **Stop everything except PostgreSQL.** Caddy and every application unit
   must be stopped before restoring; never restore under live writes. Disable the
   backup timer so a scheduled run cannot collide with the restore. Then start
   PostgreSQL only:

   ```sh
   systemctl stop apps-caddy apps-studio apps-jublawoma apps-unclet apps-zelglihof
   systemctl stop apps-oliumbi apps-identity apps-messaging apps-assets
   systemctl start apps-postgres
   ```

3. **Restore roles and database.** The globals file recreates the application
   roles and their password hashes, so treat the extraction directory as secret.

   ```sh
   podman exec -i postgres psql -U postgres -f - < globals.sql
   podman exec -i postgres pg_restore -U postgres -d apps --clean --if-exists < database.dump
   ```

   If the target database does not exist, create it first with the configured
   owner. Verify the expected schemas and row counts before continuing.

   > **Known draft gap:** a host built by `site.yml` already has the roles from
   > V001, so `globals.sql` will hit `CREATE ROLE ... already exists` and the
   > stored passwords will not apply. Reconcile roles and passwords from the
   > vault with the normal deploy role provisioning, or restore into a clean
   > cluster; settle the order during the drill. Do not start the apps against
   > mismatched roles.

4. **Restore media.**

   ```sh
   tar xzf media.tgz -C /var/lib/apps/media
   chown -R 100:100 /var/lib/apps/media   # assets image uid/gid
   ```

5. **Start the stack** with the tag recorded in `manifest.txt`:

   ```sh
   ansible-playbook playbooks/deploy.yml -e image_tag=<manifest-tag>
   ```

   The deploy re-provisions the application role passwords from the vault and
   runs the migrate unit, so confirm Flyway reports the expected head (V012).

6. **Verify** with the post-deploy checklist in
   [deployment](deployment.md#verify-after-deploying): every unit, each site,
   Studio sign-in, one image, one durable write, and a fresh backup. Confirm
   Caddy re-issued or still holds valid certificates.

7. **Record the result.** Row counts, media sample, timings, certificate
   re-issuance and any manual deviation belong in the restore report. Fix the
   procedure from what actually happened.

Until a from-zero restore succeeds, the nightly pull is the only evidence that
archives leave the server intact. The preferred drill target is the not-yet-live
replacement host after an import rehearsal, while legacy remains live. The drill
is tracked in [open work](../work/open-work.md).

## PostgreSQL major-version upgrade

Images stay pinned; a major upgrade is a planned dump/restore, not an automatic
image pull. Use the same primitives as a restore and keep the old data directory
until the new cluster is accepted.

1. **Before the window:** take a backup, pull it to the workstation, verify
   `sha256sum -c SHA256SUMS`, and record row counts and role names. Disable
   `apps-backup.timer` for the duration.
2. **Stop writers:** stop every application unit, Caddy, and the postgres unit so
   no writes can land in the old cluster.
3. **Dump from the old cluster:**

   ```sh
   podman exec postgres sh -c 'pg_dumpall -U "$POSTGRES_USER" --globals-only' > globals.sql
   podman exec postgres sh -c 'pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB"' > database.dump
   podman exec postgres postgres --version   # record the old major
   ```

4. **Switch the data directory:** move `/var/lib/apps/postgres` to
   `/var/lib/apps/postgres-<oldmajor>` (keep it; do not delete yet), create a
   fresh `/var/lib/apps/postgres` owned `70:70`, and update the postgres image to
   the new major (`tag@digest`) in `infrastructure/units/apps-postgres.container`.
5. **Start the new major** alone. The image entrypoint initializes a fresh
   cluster. Restore globals (existing `postgres`/role entries are expected and
   must not overwrite the new superuser blindly), then restore the dump with
   `pg_restore`. Extensions that are no longer available fail here, not after
   traffic returns.
6. **Reconcile credentials:** run the deploy role provisioning from the vault so
   the application roles have the current passwords, then run `apps-migrate` and
   confirm the Flyway head is V012 (or the then-current baseline). Do not start
   the apps before schema and code agree.
7. **Verify and re-enable:** start the stack, walk every site and Studio, check
   one durable write, take a fresh backup, pull it, and re-enable
   `apps-backup.timer`. Record the old/new image digests and the accepted result.
8. Delete `/var/lib/apps/postgres-<oldmajor>` only after the new cluster has been
   accepted and a fresh archive restores elsewhere.

## Failure handling

- **Backup alert fired:** check `status.yml`, the timer, disk space and the
  journal for `apps-backup`. Run `playbooks/backup.yml` manually and confirm a
  new archive. If the metric is absent, the job never reached its final step.
- **Pull failed:** verify WireGuard, then the server directory and permissions.
  A failed pull does not delete local copies.
- **Archive corrupt:** use the previous copy; three exist on the server and seven
  on the workstation. Investigate disk and encryption before trusting the next
  run.
- **Restore failed:** do not start the application units against a partial
  database. Destroy the replica and start the restore again from the archive.
