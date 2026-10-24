#!/bin/sh
set -eu

# Runs on the workstation (not the server): pulls the backup copies over
# WireGuard and keeps a week of them locally. Schedule it (cron, launchd,
# scheduled task) or run it manually. The server never holds credentials for
# the workstation -- that is why the copy is pulled, not pushed.

: "${SERVER:=deploy@10.8.0.1}"
: "${REMOTE_DIR:=/var/backups/apps}"
: "${LOCAL_DIR:=$HOME/backups/oliumbi-apps}"
: "${LOCAL_KEEP:=7}"

mkdir -p "$LOCAL_DIR"
rsync -avz --partial "$SERVER:$REMOTE_DIR/" "$LOCAL_DIR/"

# warn loudly when the newest copy is stale (backup freshness check)
newest=$(ls -1t "$LOCAL_DIR"/apps-*.age 2>/dev/null | head -n1 || true)
if [ -z "$newest" ]; then
  echo "pull-backups: no backups found in $LOCAL_DIR" >&2
  exit 1
fi
age_days=$(( ( $(date +%s) - $(stat -c %Y "$newest") ) / 86400 ))
if [ "$age_days" -gt 1 ]; then
  echo "pull-backups: WARNING newest backup is $age_days days old ($newest)" >&2
fi

ls -1t "$LOCAL_DIR"/apps-*.age | tail -n +$((LOCAL_KEEP + 1)) | xargs -r rm --
echo "pull-backups: ok ($newest)"
