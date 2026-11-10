# Operations

How the running system is operated. Every procedure here is driven from the
maintainer workstation over WireGuard; there is no reason to log into the host.

Start with the [runbook index](runbooks.md) for a symptom or task. The pages
below own the detail.

| Page | Owns |
| --- | --- |
| [Deployment](deployment.md) | release model, deploy, verify, rollback, migration coupling |
| [Release log](releases.md) | what is running, what was verified, and the rollback target |
| [Backup and restore](backup-restore.md) | what is backed up, retention, pull, restore drill |
| [Monitoring](monitoring.md) | logs, metrics, alerts, ntfy, first response |
| [Access and security](access-and-security.md) | WireGuard, provisioning from zero, secrets, DNS, security baseline |
| [Housekeeping](housekeeping.md) | image and journal retention, updates, quarterly drill |
| [Runbooks](runbooks.md) | concise procedures for common failures and changes |
| [Migration and cutover](../work/migration.md) | replacing the legacy stack |

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

If any of these is false, open [runbooks](runbooks.md) before changing
anything.
