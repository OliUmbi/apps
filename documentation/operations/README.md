# Operations

How the running system is operated. Routine changes go through Ansible from the
maintainer workstation over WireGuard; the same tunnel carries the host commands
used during a restore. There is no reason to reach the machine any other way.

Start with the runbook for what you are doing. The reference pages own the policy
and the detail; a runbook owns the steps and the stop rules.

## Runbooks

| Runbook | Use for |
| --- | --- |
| [Server setup](runbooks/setup.md) | empty host → healthy stack, first admin, SSH lockdown |
| [Release](runbooks/release.md) | deploy, verify, roll back, failed migration |
| [Backup](runbooks/backup.md) | run and verify a backup, pull it, key handling |
| [Restore](runbooks/restore.md) | disaster restore, drill, PostgreSQL major upgrade |
| [Maintenance](runbooks/maintenance.md) | weekly housekeeping, quarterly drill, host updates |
| [Dependencies](runbooks/dependencies.md) | monthly digest refresh, runtime bumps, held upgrades |
| [Security](runbooks/security.md) | scan triage, secret rotation, access review, data deletion |
| [Edge](runbooks/edge.md) | domains, certificates, Caddy behaviour |
| [Incidents](runbooks/incidents.md) | a site, the database, mail, TLS or the host is broken |
| [Cutover](runbooks/cutover.md) | legacy cutover and retirement |

Local development setup is in
[development/local-setup.md](../development/local-setup.md); it is a workstation
concern, not a server runbook.

## Checklists

These are records, not procedures: run the matching runbook and write the
evidence here.

| Checklist | Use for |
| --- | --- |
| [Go-live evidence](checklists/go-live.md) | every launch-gate, DR, RV and TD check |
| [Restore drill record](checklists/restore-drill.md) | one from-zero restore |
| [Quarterly drill record](checklists/quarterly.md) | the recurring quarter |

## Reference pages

| Page | Owns |
| --- | --- |
| [Deployment](deployment.md) | release model, migration coupling, rollback policy |
| [Release log](releases.md) | what is running, what was verified, the rollback target |
| [Backup and restore](backup-restore.md) | archive contents, key policy, freshness, ACME policy |
| [Monitoring](monitoring.md) | logs, metrics, alert rules, ntfy, dashboards |
| [Access and security](access-and-security.md) | access model, secrets, DNS policy, security baseline |
| [Housekeeping](housekeeping.md) | retention policy and what must never be deleted |
| [Migration](../work/migration.md) | replacing the legacy stack; cutover playbook |

Architecture context: [architecture](../architecture/README.md). Unfinished
operational work: [open work](../work/open-work.md).

## The operating model

- **One host.** Debian stable, podman/Quadlet systemd units, one PostgreSQL.
- **One entry point.** Ansible over WireGuard. SSH is never public once
  `restrict_ssh` is on; recovery is physical access to the machine.
- **One direction for secrets.** The Ansible vault renders per-service
  `/etc/default/apps-<service>` files (root, `0600`). Nothing secret is
  committed, and the server holds no workstation credentials.
- **Pinned releases.** Images are immutable tags. Deploy and rollback are the
  same command with a different tag.
- **Boring recovery.** State the backup covers lives in plain directories under
  `/var/lib/apps/`: `postgres` and `media`. Backup and restore are `pg_dump` and
  `tar`. Caddy's `caddy-data`/`caddy-config` are durable state too, but are
  deliberately re-issued instead of backed up (D21/TD-16).

## Command reference

Run from `ansible/`:

| Command | Does |
| --- | --- |
| `ansible-playbook playbooks/site.yml -e image_tag=<tag>` | full server setup (idempotent) |
| `ansible-playbook playbooks/deploy.yml -e image_tag=<tag>` | deploy or roll back |
| `ansible-playbook playbooks/first-admin.yml --ask-vault-pass` | one-time first administrator |
| `ansible-playbook playbooks/status.yml` | units, containers, disk, timers, last backup |
| `ansible-playbook playbooks/logs.yml -e service=<name>` | read unit logs |
| `ansible-playbook playbooks/backup.yml` | run a backup now |
| `ansible-playbook playbooks/housekeep.yml` | run housekeeping now |

Grafana (`:3000`), Prometheus (`:9090`) and Alertmanager (`:9093`) bind to the
server's WireGuard address and are reachable only inside the tunnel.

## What "healthy" looks like

- `status.yml` shows every `apps-*` unit active, timers enabled, disk below the
  alert threshold, and a recent backup.
- Blackbox probes for the sites and postgres pass; certificate expiry is far
  away.
- `apps_backup_last_success_timestamp_seconds` is younger than 36 hours.
- No `UnitFailing` or `UnitRestartLoop` alert is firing.
- The newest pulled archive on the workstation is recent.

If any of these is false, open [incidents](runbooks/incidents.md) before changing
anything.

## Conventions

- **A runbook is executable.** It starts with when to use it, lists exact
  commands, and ends with "done when" and "if it fails". If you change a
  procedure, change the runbook, not a copied snippet elsewhere.
- **Verify the target first.** Every destructive command names the host,
  directory or database it touches. When recovery and diagnosis conflict, restore
  service first and investigate afterwards.
- **Record evidence.** A release goes in the [release log](releases.md); a launch
  check or drill goes in the [checklists](checklists/go-live.md). An incident
  that reveals a defect becomes an entry in [open work](../work/open-work.md) or
  [technical debt](../work/tech-debt.md), never only a chat log.
- **One fact, one owner.** The reference pages hold policy; the runbooks hold
  steps; the registers hold status.
