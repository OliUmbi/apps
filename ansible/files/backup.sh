#!/bin/sh
set -eu

# Nightly backup: postgres dump + globals + media archive, age-encrypted,
# rotated (a few copies on the server, see BACKUP_KEEP). The workstation pulls
# the copies over WireGuard (see ansible/files/pull-backups.sh).
#
# State lives in plain host directories (deployment-plan D12), so this is
# pg_dump and tar -- no container tooling beyond podman exec for postgres.
# Config comes from /etc/default/apps-backup (written by ansible).
#
# Deliberately excluded: Caddy's ACME state (TD-16). A rebuilt host re-issues
# certificates through DNS-01 using the Caddyfile and the vault token, so the
# certificates are not part of the archive.
#
# PostgreSQL major-version upgrades (dump/restore) are a documented procedure,
# not part of this nightly job: see documentation/operations/backup-restore.md
# and TD-04 in documentation/work/tech-debt.md.

[ -f /etc/default/apps-backup ] && . /etc/default/apps-backup

: "${BACKUP_DIR:=/var/backups/apps}"
: "${BACKUP_KEEP:=3}"
: "${MEDIA_DIR:=/var/lib/apps/media}"
: "${AGE_RECIPIENT:?AGE_RECIPIENT not set (age public key of the workstation)}"

STAMP=$(date -u +%Y%m%dT%H%M%SZ)
WORK=$(mktemp -d)
OUTER=$(mktemp)
trap 'rm -rf "$WORK" "$OUTER"' EXIT

echo "backup: database"
podman exec postgres sh -c 'pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB"' > "$WORK/database.dump"
# globals carry the roles (identity, messaging, assets, per-site users)
podman exec postgres sh -c 'pg_dumpall -U "$POSTGRES_USER" --globals-only' > "$WORK/globals.sql"

echo "backup: media"
tar czf "$WORK/media.tgz" -C "$MEDIA_DIR" .

{
  echo "date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "postgres: $(podman exec postgres postgres --version)"
  echo "images:"
  podman ps --format '{{.Names}} {{.Image}}'
} > "$WORK/manifest.txt"

# Relative names make the manifest portable: after extraction,
# `sha256sum -c SHA256SUMS` works anywhere (TD-17).
(cd "$WORK" && sha256sum * > SHA256SUMS)

echo "backup: archive + verify"
tar czf "$OUTER" -C "$WORK" .
# Fail closed: a corrupt outer archive must never be encrypted or counted as a
# successful backup (DR-08). `tar tzf` exits non-zero on a bad stream.
tar tzf "$OUTER" > /dev/null

echo "backup: encrypt + rotate (keep ${BACKUP_KEEP})"
mkdir -p "$BACKUP_DIR"
# Encrypt to a temporary name and rename only after age succeeds, so a partial
# file never looks like a valid backup.
age -r "$AGE_RECIPIENT" -o "$BACKUP_DIR/apps-$STAMP.tar.gz.age.tmp" "$OUTER"
mv -f "$BACKUP_DIR/apps-$STAMP.tar.gz.age.tmp" "$BACKUP_DIR/apps-$STAMP.tar.gz.age"
ls -1t "$BACKUP_DIR"/apps-*.age | tail -n +$((BACKUP_KEEP + 1)) | xargs -r rm --

# Freshness + size metrics for prometheus (node exporter textfile collector).
# Publish atomically and only after every step above succeeded (RV-02).
if [ -n "${TEXTFILE_DIR:-}" ]; then
  mkdir -p "$TEXTFILE_DIR"
  {
    echo "apps_backup_last_success_timestamp_seconds $(date +%s)"
    echo "apps_backup_size_bytes $(stat -c %s "$BACKUP_DIR/apps-$STAMP.tar.gz.age")"
  } > "$TEXTFILE_DIR/apps_backup.prom.tmp"
  mv -f "$TEXTFILE_DIR/apps_backup.prom.tmp" "$TEXTFILE_DIR/apps_backup.prom"
fi

echo "backup: done apps-$STAMP.tar.gz.age"
