# Maintenance

**When:** the weekly housekeeping timer has run, a manual cleanup is needed, the
quarterly drill is due, or the host needs an update. Retention policy and what
must never be deleted are in [housekeeping](../housekeeping.md).

## Weekly housekeeping

`apps-housekeep.timer` runs Sunday at 04:00 by default. It expires operational
history (delivery records, inbox rows, audit events, analytics counters), prunes
images older than a week, prunes stopped containers, caps journald and publishes
the success metric. Product data is never deleted.

Run it by hand:

```sh
cd ansible
ansible-playbook playbooks/housekeep.yml
ansible-playbook playbooks/logs.yml -e service=housekeep
```

Confirm it ran from `status.yml` or `apps_housekeep_last_success_timestamp_seconds`
and that disk is stable. `HousekeepStale` fires when the metric is absent or
older than eight days.

Keep the last week of images: they are the rollback window. Never prune named
volumes; monitoring state is intentionally outside the backup (DR-09).

## Quarterly drill

At least once a quarter:

1. Run a full `apt upgrade`, reboot, and confirm every unit and probe recovers.
2. Confirm housekeeping ran and disk is stable.
3. Confirm the backup timer and the workstation pull both ran.
4. Exercise one restore path as far as the available hardware allows, including
   certificate re-issuance ([restore](restore.md)).
5. Review expiring certificates and DNS records.
6. Review access: accounts, permissions and any credential that should rotate
   ([security](security.md#access-review)).

Record the drill result and add anything that failed to
[open work](../../work/open-work.md) or [technical debt](../../work/tech-debt.md).

## Host updates

- **Security updates** run automatically through `unattended-upgrades`.
- **A full `apt upgrade`** is a planned action, not unattended: read the
  changelog for podman and the kernel, reboot in a known window, then confirm
  every unit, probe and timer recovers.
- **Application and base images** move only by changing a pinned tag or digest,
  running CI and deploying ([dependencies](dependencies.md)).
- **PostgreSQL major versions** are a planned dump/restore, never an image pull
  ([restore](restore.md#postgresql-major-upgrade)).

## Done when

- The timer's success metric is recent and disk is below the alert threshold.
- The drill result is recorded and any new work is in a register.
- The host and images are on the versions recorded in
  [the dependency register](../../reference/versions.md).
