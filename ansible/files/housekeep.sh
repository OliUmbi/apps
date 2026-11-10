#!/bin/sh
set -eu

[ -f /etc/default/apps-housekeep ] && . /etc/default/apps-housekeep

: "${TEXTFILE_DIR:=/var/lib/node-exporter-textfile}"
: "${QUEUE_RETENTION_DAYS:=30}"
: "${MESSAGE_RETENTION_DAYS:=365}"
: "${AUDIT_RETENTION_DAYS:=548}"
: "${ANALYTICS_RETENTION_DAYS:=760}"

# Weekly housekeeping. Bounded on purpose: expired operational data, a week of
# images for rollback, what nothing references, and a capped journald.
#
# Retention is deliberately conservative: product data (inquiries, reservations,
# subscribers, donations) is never deleted here. Only the transport copies and
# the audit trail age out. Revisit this as a scheduled job inside a service if
# the table list or the policy grows.

# One run at a time: a manual invocation must not interleave with the timer.
exec 9> /run/apps-housekeep.lock
flock -n 9 || {
	echo "housekeep: another run holds the lock"
	exit 0
}

POSTGRES_USER=$(podman exec postgres printenv POSTGRES_USER)
POSTGRES_DB=$(podman exec postgres printenv POSTGRES_DB)

echo "housekeep: expired delivery history, inbox rows and audit events"
# SENT/FAILED only: a PENDING or PROCESSING message is still owned by the
# worker. message_attempt rows cascade with their message.
podman exec postgres psql -v ON_ERROR_STOP=1 \
	-U "$POSTGRES_USER" -d "$POSTGRES_DB" \
	-c "DELETE FROM messaging.message WHERE status IN ('SENT', 'FAILED') AND created_at < now() - interval '${MESSAGE_RETENTION_DAYS} days';" \
	-c "DELETE FROM queue.message WHERE created_at < now() - interval '${QUEUE_RETENTION_DAYS} days';" \
	-c "DELETE FROM studio.audit_event WHERE created_at < now() - interval '${AUDIT_RETENTION_DAYS} days';" \
	-c "DELETE FROM analytics.view_daily WHERE day < current_date - make_interval(days => ${ANALYTICS_RETENTION_DAYS});"

echo "housekeep: podman image gc (keep 7 days)"
podman image prune -af --filter "until=168h"
podman container prune -f
# Named volumes (prometheus history, grafana dashboards/users) are intentionally
# never pruned: they are not backed up and a stopped container would make them
# look unused (DR-09).

echo "housekeep: journald"
journalctl --vacuum-size=200M

# Success metric last: a failed stage above must not look like a good run.
if [ -n "${TEXTFILE_DIR:-}" ]; then
	mkdir -p "$TEXTFILE_DIR"
	echo "apps_housekeep_last_success_timestamp_seconds $(date +%s)" \
		> "$TEXTFILE_DIR/apps_housekeep.prom.tmp"
	mv -f "$TEXTFILE_DIR/apps_housekeep.prom.tmp" \
		"$TEXTFILE_DIR/apps_housekeep.prom"
fi

echo "housekeep: disk"
df -h /
podman system df
