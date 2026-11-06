# Housekeeping and updates

Recurring cleanup keeps disk bounded and leaves a week of images for rollback.
It runs on the server as a systemd timer, never from the workstation.

## Weekly timer

Sunday 04:00, `apps-housekeep.timer` runs `ansible/files/housekeep.sh`:

1. `podman image prune -af --filter "until=168h"` - remove images older than
   seven days, keeping fresh rollback candidates;
2. `podman container prune -f` - remove stopped containers;
3. `podman volume prune -f` - remove unreferenced volumes (monitoring state is a
   named volume and stays while its container exists);
4. `journalctl --vacuum-size=200M` - enforce the log cap;
5. report `df -h /` and `podman system df` to the journal.

Run it manually when needed:

```sh
ansible-playbook playbooks/housekeep.yml
ansible-playbook playbooks/logs.yml -e service=housekeep
```

## What not to clean

- `/var/lib/apps/postgres`, `/var/lib/apps/media`, `/var/lib/apps/caddy-*` are
  durable state. They are never touched by housekeeping and are not safe to
  delete.
- The last week of application images is the rollback window. Shortening the
  filter trades rollback convenience for disk.
- Monitoring named volumes hold Prometheus and Grafana state. They are not
  backed up; deleting them loses history, not application data.

## Updates

- **Security updates** run automatically through `unattended-upgrades`.
- **A full `apt upgrade`** is part of the quarterly drill, not an unattended
  action. Read the changelog for podman and the kernel, then reboot in a known
  window and verify the stack.
- **Application and base images** are updated by changing the pinned tag or
  digest, running CI, and deploying. Upstream monitoring images are pinned by
  `tag@digest`; bump both together.
- **PostgreSQL major upgrades** are not automated. The dump/restore path is not
  documented yet ([TD-04](../work/tech-debt.md#td-04)).

## Quarterly drill

At least once a quarter:

1. Run a full `apt upgrade`, reboot, and confirm every unit and probe recovers.
2. Confirm housekeeping ran and disk is stable.
3. Confirm the backup timer and the workstation pull both ran.
4. Exercise one restore path as far as the available hardware allows.
5. Review expiring certificates and DNS records.
6. Review access: accounts, permissions and any credential that should rotate.
