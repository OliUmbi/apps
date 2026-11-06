#!/bin/sh
set -eu

# Weekly housekeeping. Bounded on purpose: keeps a week of images for
# rollback, prunes what nothing references, caps journald.

echo "housekeep: podman image gc (keep 7 days)"
podman image prune -af --filter "until=168h"
podman container prune -f
podman volume prune -f

echo "housekeep: journald"
journalctl --vacuum-size=200M

echo "housekeep: disk"
df -h /
podman system df
