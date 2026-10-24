#!/bin/sh
set -eu

# Weekly housekeeping. Bounded on purpose: keeps a week of images for
# rollback, prunes what nothing references, caps journald.

echo "housekeep: docker image gc (keep 7 days)"
docker image prune -af --filter "until=168h"
docker container prune -f --filter "until=168h"
docker volume prune -f

echo "housekeep: journald"
journalctl --vacuum-size=200M

echo "housekeep: disk"
df -h /
docker system df
