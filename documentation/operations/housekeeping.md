# Housekeeping and updates

Recurring cleanup keeps disk bounded and leaves a week of images for rollback.
It runs on the server as a systemd timer, never from the workstation.

## Weekly timer

Sunday 04:00, `apps-housekeep.timer` runs `ansible/files/housekeep.sh`:

1. `podman image prune -af --filter "until=168h"` - remove images older than
   seven days, keeping fresh rollback candidates;
2. `podman container prune -f` - remove stopped containers;
3. `journalctl --vacuum-size=200M` - enforce the log cap;
4. report `df -h /` and `podman system df` to the journal.

The timer schedule is templated from `housekeep_day` and `housekeep_hour` in
`ansible/group_vars/all.yml`; the backup timer is templated the same way from
`backup_hour`. Change the variable and redeploy, not the unit on the server.

Run it manually when needed:

```sh
ansible-playbook playbooks/housekeep.yml
ansible-playbook playbooks/logs.yml -e service=housekeep
```

## What not to clean

- `/var/lib/apps/postgres`, `/var/lib/apps/media`, `/var/lib/apps/caddy-*` are
  durable state. They are never touched by housekeeping and are not safe to
  delete.
- **No volume prune runs.** Named volumes hold Prometheus and Grafana state;
  they are not backed up, and a stopped container would make them look unused.
  They are preserved deliberately (DR-09).
- The last week of application images is the rollback window. Shortening the
  filter trades rollback convenience for disk.
- Grafana dashboards are imported by hand and live in `data-grafana`; only the
  Prometheus datasource is provisioned as code. Losing the volume loses history
  and dashboards, not application data.

## Updates

- **Security updates** run automatically through `unattended-upgrades`.
- **A full `apt upgrade`** is part of the quarterly drill, not an unattended
  action. Read the changelog for podman and the kernel, then reboot in a known
  window and verify the stack.
- **Application and base images** are updated by changing the pinned tag or
  digest, running CI, and deploying. Upstream monitoring images are pinned by
  `tag@digest`; bump both together.
- **PostgreSQL major upgrades** are not automated. The dump/restore procedure is
  documented in
  [backup and restore](backup-restore.md#postgresql-major-version-upgrade).

## Quarterly drill

At least once a quarter:

1. Run a full `apt upgrade`, reboot, and confirm every unit and probe recovers.
2. Confirm housekeeping ran and disk is stable.
3. Confirm the backup timer and the workstation pull both ran.
4. Exercise one restore path as far as the available hardware allows, including
   Caddy certificate re-issuance.
5. Review expiring certificates and DNS records.
6. Review access: accounts, permissions and any credential that should rotate.
