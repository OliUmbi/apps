# Housekeeping and updates

Recurring cleanup keeps disk bounded and leaves a week of images for rollback.
It runs on the server as a systemd timer, never from the workstation.

## Weekly timer

Sunday 04:00, `apps-housekeep.timer` runs `ansible/files/housekeep.sh`:

1. **Expired operational data.** Retention comes from
   `/etc/default/apps-housekeep`, templated from `ansible/group_vars/all.yml`:
   `messaging.message` in `SENT`/`FAILED` after 365 days (attempts cascade),
   `queue.message` older than 30 days, `studio.audit_event` older than 548
   days (18 months) and `analytics.view_daily` older than 760 days (25 months).
   Product data - inquiries, reservations, subscribers, donations - is never
   deleted here.
2. `podman image prune -af --filter "until=168h"` - remove images older than
   seven days, keeping fresh rollback candidates;
3. `podman container prune -f` - remove stopped containers;
4. `journalctl --vacuum-size=200M` - enforce the log cap;
5. publish `apps_housekeep_last_success_timestamp_seconds` for the
   node-exporter textfile collector, then report `df -h /` and
   `podman system df` to the journal.

`flock` prevents a manual run from interleaving with the timer. The success
metric is written last, so a failed stage leaves the alert firing
(`HousekeepStale`: absent or older than eight days).

The timer schedule is templated from `housekeep_day` and `housekeep_hour` in
`ansible/group_vars/all.yml`; the backup timer is templated the same way from
`backup_hour`. Change the variable and redeploy, not the unit on the server.

The retention job is a shell script today because it is a handful of deletes on
one host. If the policy grows (per-table windows, anonymization, a staging or
export path), move it into a scheduled job owned by the service that owns the
data instead of expanding the script. Recorded as [TD-22](../work/tech-debt.md#td-22).

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
