#!/bin/sh
set -eu

# Nightly backup: postgres dump + globals + media archive, age-encrypted,
# rotated (a few copies on the server, see BACKUP_KEEP). The workstation pulls
# the copies over WireGuard (see ansible/files/pull-backups.sh).
#
# Config comes from /etc/default/apps-backup (written by ansible).

[ -f /etc/default/apps-backup ] && . /etc/default/apps-backup

: "${BACKUP_DIR:=/var/backups/apps}"
: "${BACKUP_KEEP:=3}"
: "${PROJECT_DIR:=/apps}"
: "${AGE_RECIPIENT:?AGE_RECIPIENT not set (age public key of the workstation)}"

COMPOSE="docker compose --env-file ${PROJECT_DIR}/.env -f ${PROJECT_DIR}/compose.prod.yaml"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

echo "backup: database"
${COMPOSE} exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB"' > "$WORK/database.dump"
# globals carry the roles (identity, messaging, assets, per-site users)
${COMPOSE} exec -T postgres sh -c 'pg_dumpall -U "$POSTGRES_USER" --globals-only' > "$WORK/globals.sql"

echo "backup: media"
docker run --rm -v oliumbi-apps_assets-data:/media:ro -v "$WORK:/out" alpine \
  tar czf /out/media.tgz -C /media .

{
  echo "date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "postgres: $(${COMPOSE} exec -T postgres postgres --version)"
  echo "images:"
  ${COMPOSE} config --images
} > "$WORK/manifest.txt"
sha256sum "$WORK"/* > "$WORK/SHA256SUMS"

echo "backup: encrypt + rotate (keep ${BACKUP_KEEP})"
mkdir -p "$BACKUP_DIR"
tar czf - -C "$WORK" . | age -r "$AGE_RECIPIENT" -o "$BACKUP_DIR/apps-$STAMP.tar.gz.age"
ls -1t "$BACKUP_DIR"/apps-*.age | tail -n +$((BACKUP_KEEP + 1)) | xargs -r rm --

# freshness + size metrics for prometheus (node exporter textfile collector)
if [ -n "${TEXTFILE_DIR:-}" ]; then
  mkdir -p "$TEXTFILE_DIR"
  {
    echo "apps_backup_last_success_timestamp_seconds $(date +%s)"
    echo "apps_backup_size_bytes $(stat -c %s "$BACKUP_DIR/apps-$STAMP.tar.gz.age")"
  } > "$TEXTFILE_DIR/apps_backup.prom"
fi

echo "backup: done apps-$STAMP.tar.gz.age"
