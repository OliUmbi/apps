# Backup and restore

A backup that was never restored is a hypothesis, not a backup. The nightly
pipeline is automated and monitored; the restore drill is still pending because
it needs a dedicated machine.

## What is backed up

Nightly at 03:00 (`apps-backup.timer`, script `ansible/files/backup.sh`):

1. `pg_dump -Fc` of the application database;
2. `pg_dumpall --globals-only` (the roles live there);
3. a `tar.gz` of `/var/lib/apps/media` (uploads);
4. a `manifest.txt` with the date, postgres version and running image tags;
5. `SHA256SUMS` over the archive contents.

The whole set is packed into one `age`-encrypted archive,
`/var/backups/apps/apps-<UTC-stamp>.tar.gz.age`. The server keeps three copies.

The backup does **not** include monitoring state (deliberately, D12), the
Ansible vault, or Caddy's ACME state. Certificates can be re-issued, but that is
subject to Let's Encrypt rate limits; see [TD-16](../work/tech-debt.md#td-16).

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

An alert fires after 36 hours without a successful backup. The pull script warns
locally when the newest copy is stale. The metrics prove the job ran and the
archive exists; they do not prove it restores.

## Restore (untested until the drill)

The workstation drill was retired with the old compose files (D14). The intended
procedure rebuilds a dedicated machine from zero and restores a pulled archive.
**It is not yet exercised; treat it as a runbook draft until the drill passes.**
A restore playbook does not exist yet, so the sequence below is manual.

On the new machine, after `playbooks/site.yml` has installed podman and the
units (but before the application units matter):

1. **Prepare the archive on the workstation.**

   ```sh
   age -d -i <age-identity-file> apps-<stamp>.tar.gz.age > apps-<stamp>.tar.gz
   tar xzf apps-<stamp>.tar.gz
   # SHA256SUMS records the server's temporary paths; rewrite them to filenames.
   sed 's#  .*/#  #' SHA256SUMS | sha256sum -c -
   ```

   The manifest-portability gap is [TD-17](../work/tech-debt.md#td-17). Until it
   is fixed, verify the hashes against the files in the extraction directory.

2. **Stop everything except PostgreSQL.** Caddy and every application unit
   must be stopped before restoring; never restore under live writes. Then start
   PostgreSQL only:

   ```sh
   systemctl stop apps-caddy apps-studio apps-jublawoma apps-unclet apps-zelglihof
   systemctl stop apps-identity apps-messaging apps-assets
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
   > vault (the normal deploy path) or restore into a clean cluster; settle the
   > order during the drill. Do not start the apps against mismatched roles.

4. **Restore media.**

   ```sh
   tar xzf media.tgz -C /var/lib/apps/media
   chown -R 100:100 /var/lib/apps/media   # assets image uid/gid
   ```

5. **Start the stack** with the tag recorded in `manifest.txt`:

   ```sh
   ansible-playbook playbooks/deploy.yml -e image_tag=<manifest-tag>
   ```

6. **Verify** with the post-deploy checklist in
   [deployment](deployment.md#verify-after-deploying): every unit, each site,
   Studio sign-in, one image, one durable write, and a fresh backup.

7. **Record the result.** Row counts, media sample, timings and any manual
   deviation belong in the restore report. Fix the procedure from what actually
   happened.

Until a restore on spare hardware succeeds, the nightly pull is the only evidence
that archives leave the server intact. The drill is tracked in
[open work](../work/open-work.md) and blocked on hardware.

## Failure handling

- **Backup alert fired:** check `status.yml`, the timer, disk space and the
  journal for `apps-backup`. Run `playbooks/backup.yml` manually and confirm a
  new archive.
- **Pull failed:** verify WireGuard, then the server directory and permissions.
  A failed pull does not delete local copies.
- **Archive corrupt:** use the previous copy; three exist on the server and seven
  on the workstation. Investigate disk and encryption before trusting the next
  run.
- **Restore failed:** do not start the application units against a partial
  database. Destroy the replica and start the restore again from the archive.
