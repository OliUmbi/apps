# Backup and restore policy

A backup that was never restored is a hypothesis, not a backup. The nightly
pipeline is automated, fail-closed and monitored; the from-zero restore drill is
still pending because it needs a dedicated machine.

**Procedures:** [backup](runbooks/backup.md) and
[restore, drill and PostgreSQL major upgrade](runbooks/restore.md). This page
owns the archive contents, retention and the decisions the procedures depend on.

## What is backed up

Nightly at 03:00 by default (`apps-backup.timer`, templated from `backup_hour`;
script `ansible/files/backup.sh`):

1. `pg_dump -Fc` of the application database;
2. `pg_dumpall --globals-only` (the roles live there);
3. a `tar.gz` of `/var/lib/apps/media` (uploads);
4. a `manifest.txt` with the date, postgres version and running image tags;
5. `SHA256SUMS` over the archive contents, written with relative names.

The set is packed into one `age`-encrypted archive,
`/var/backups/apps/apps-<UTC-stamp>.tar.gz.age`. The server keeps three copies;
the workstation pull keeps seven.

The pipeline fails closed: the media tar and outer archive are written to files,
the outer archive is verified with `tar tzf` before encryption, `age` writes a
temporary file renamed only on success, and the freshness metric is written last.
A failed stage leaves no new archive and no success metric.

The backup does **not** include monitoring state (deliberately, D12), the Ansible
vault, or Caddy's ACME state. Certificates are re-issued rather than copied (D21);
the [edge runbook](runbooks/edge.md#certificate-re-issuance) owns that procedure.

## Key handling

The server only ever holds the **public** `age` recipient in the vault. The
private identity is passphrase-wrapped, kept in the password manager and printed
with its passphrase and the restore commands on one recovery sheet. Losing the
identity loses every archive; losing only the workstation is recoverable from the
sheet. The one-time generation and the replacement procedure are in the
[backup runbook](runbooks/backup.md#key-handling-once-then-treat-it-as-done).

## Freshness and verification

`backup.sh` writes `apps_backup_last_success_timestamp_seconds` and
`apps_backup_size_bytes` for the node-exporter textfile collector. The textfile
is written to a temporary path and renamed atomically after every stage.
`BackupStale` fires when the metric is **absent** as well as when it is older
than 36 hours (RV-02). The pull script warns locally when the newest copy is
stale.

The metrics prove the job ran and the archive exists; they do not prove it
restores. The drill is the only evidence for that, and it is tracked in
[open work](../work/open-work.md).

## Restore and major upgrades

Restore is manual: there is no restore playbook. The procedure rebuilds a
dedicated machine from zero, restores a pulled archive, re-issues certificates and
walks every site. **It has not been exercised yet; treat it as a draft until the
drill passes.** PostgreSQL major versions use the same primitives as a planned
dump/restore, never an image pull.

Both procedures, including the known draft gap around pre-existing roles, are in
the [restore runbook](runbooks/restore.md).

## Failure policy

- **Backup alert or failed run:** do not write the success metric by hand; fix
  the failing stage ([backup](runbooks/backup.md#if-it-fails)).
- **Pull failed:** local copies are never deleted by a failed pull; verify the
  tunnel and server permissions.
- **Archive corrupt:** use an older copy; three exist on the server and seven on
  the workstation.
- **Restore failed:** never start the application units against a partial
  database; destroy the replica and start again
  ([restore](runbooks/restore.md#if-it-fails)).
