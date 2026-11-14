# Housekeeping policy

Recurring cleanup keeps disk bounded and leaves a week of images for rollback.
It runs on the server as a systemd timer, never from the workstation.

**Procedure:** [maintenance](runbooks/maintenance.md#weekly-housekeeping). This
page owns what is expired and what must never be deleted.

## Weekly timer

Sunday 04:00, `apps-housekeep.timer` runs `ansible/files/housekeep.sh`:

1. **Expired operational data.** Retention comes from
   `/etc/default/apps-housekeep`, templated from `ansible/group_vars/all/all.yml`:
   `messaging.message` in `SENT`/`FAILED` after 365 days (attempts cascade),
   `queue.message` older than 30 days only when a terminal delivery record
   already exists for it (a row the worker has not taken up is never expired),
   `studio.audit_event` older than 548 days (18 months) and
   `analytics.view_daily` older than 760 days (25 months).
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
`ansible/group_vars/all/all.yml`; the backup timer is templated the same way from
`backup_hour`. Change the variable and redeploy, not the unit on the server.

## What not to clean

- `/var/lib/apps/postgres`, `/var/lib/apps/media`, `/var/lib/apps/caddy-*` are
  durable state. They are never touched by housekeeping and are not safe to
  delete.
- **No volume prune runs.** Named volumes hold Prometheus and Grafana state;
  they are not backed up, and a stopped container would make them look unused.
  They are preserved deliberately (DR-09).
- The last week of application images is the rollback window. Shortening the
  filter trades rollback convenience for disk.
- Grafana dashboards are provisioned from
  `infrastructure/monitoring/grafana/provisioning/dashboards` on every start;
  `data-grafana` holds history, users and annotations. Losing the volume loses
  history, not application data or dashboards.

## The shell job

The retention job is a shell script because it is a handful of deletes on one
host. If the policy grows (per-table windows, anonymization, a staging or export
path), move it into a scheduled job owned by the service that owns the data
instead of expanding the script. Recorded as
[TD-22](../work/tech-debt.md#td-22).
