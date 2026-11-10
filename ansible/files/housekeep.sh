#!/bin/sh
set -eu

# Weekly housekeeping. Bounded on purpose: keeps a week of images for
# rollback, prunes what nothing references, caps journald.

echo "housekeep: podman image gc (keep 7 days)"
podman image prune -af --filter "until=168h"
podman container prune -f
# Named volumes (prometheus history, grafana dashboards/users) are intentionally
# never pruned: they are not backed up and a stopped container would make them
# look unused (DR-09).

echo "housekeep: journald"
journalctl --vacuum-size=200M

echo "housekeep: disk"
df -h /
podman system df
