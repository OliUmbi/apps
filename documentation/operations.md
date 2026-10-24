# Operations

How the system is run day to day. Architecture and code layout:
[architecture.md](architecture.md). Open issues: [open-work.md](open-work.md).

## Access model

Everything is managed from the workstation over WireGuard with Ansible; there
is no reason to log into the machine.

| command | does |
| --- | --- |
| `ansible-playbook playbooks/site.yml` | full server setup (idempotent) |
| `ansible-playbook playbooks/deploy.yml -e image_tag=<tag>` | deploy or roll back |
| `ansible-playbook playbooks/status.yml` | containers, disk, timers, last backup |
| `ansible-playbook playbooks/logs.yml -e service=<name>` | read container logs |
| `ansible-playbook playbooks/backup.yml` | run a backup now |
| `ansible-playbook playbooks/housekeep.yml` | run housekeeping now |

Grafana (`:3000`), Prometheus (`:9090`) and Alertmanager (`:9093`) are bound
to the server's WireGuard address and reachable only inside the tunnel.

There is no host firewall, on purpose: the router forwards are the outer
boundary (80/443 and the WireGuard port), and docker published ports bypass
ufw anyway -- **what containers publish and the address they bind decides
exposure**. Keep admin interfaces bound to the WireGuard address.

Secrets live in `ansible/group_vars/vault.yml` (ansible-vault) and are
rendered into `/apps/.env` (root, `0600`). Nothing secret is committed.

## Provisioning from zero

For a clean machine (the legacy box stays untouched until cutover):

1. **Workstation prep.** Ansible installed, `age-keygen` for the backup key,
   `wg genkey` for both WireGuard keys, an Infomaniak API token with
   `domain:read`, `dns:read`, `dns:write`.
2. **Router.** Reserve a LAN IP for the server and forward **TCP 80 + 443**
   and **UDP 51820** (WireGuard) to it. Nothing else. Without the UDP
   forward the VPN only works inside your LAN.
3. **Server.** Install Debian stable, create the `deploy` user with your SSH
   key and sudo. First login happens over the LAN.
4. **DNS.** Create the A records listed in `dyndns_records`
   (`ansible/group_vars/all.yml`) once in the Infomaniak manager; the timer
   keeps their values current. `vpn.oliumbi.ch` is the laptop's WireGuard
   endpoint, so it survives IP changes.
5. **Vault.** Fill `ansible/group_vars/vault.yml` from the example.
6. **Run** `ansible-playbook playbooks/site.yml` -- installs docker,
   WireGuard and the timers, then deploys both stacks from ghcr (publish a
   version tag first so the images exist).
7. **Verify.** `status.yml`, `logs.yml`, a `backup.yml` run pulled with
   `pull-backups.ps1`, Grafana over the tunnel, certificates issued, and
   `apps-dyndns.timer` logs showing the records are current.
8. **Lock down** (`restrict_ssh: true`) only after WireGuard works from the
   laptop both over the LAN and from outside. Your recovery path is simply
   plugging a screen into the machine -- no provider console needed.

## DNS

One Infomaniak API token does all DNS work: caddy solves ACME DNS-01
(wildcard certificates) and `ansible/files/dyndns.sh` (systemd timer, every
15 minutes) keeps the managed A records on the current public IP. It only
updates existing records listed in `dyndns_records`; it never creates or
deletes anything.

## Logging

Policy, so nobody has to invent one later:

- **Everything logs to stdout/stderr.** Docker's `json-file` driver with
  `10m x 3` rotation per container (set in `/etc/docker/daemon.json`, so it
  applies even to containers without a compose logging block). Journald is
  capped at 200M. Disk usage is therefore bounded by design.
- **Read logs with `playbooks/logs.yml`** (`docker compose logs` under the
  hood). Logs are for debugging and post-mortems; alerts come from metrics.
- **What not to log:** secrets, tokens, full request bodies, personal data.
  Caddy access logs (stdout) contain IP addresses; rotation keeps the
  retention window short. That is acceptable at this scale -- revisit if the
  sites get real traffic.
- **Errors should carry context** (what was attempted, ids, outcome), not
  stack traces on every request. `X-Request-Id` style correlation is nice to
  have, not required today.
- **When to upgrade:** if you find yourself grepping across five containers
  regularly, add Loki and query from Grafana. Not needed now.

## Deploy and rollback

Images are built by CI (`publish.yml`) on a version tag and pinned in compose
by `IMAGE_TAG`. Deploy and rollback are the same command with a different tag
(`deploy.yml`); `migrate` runs first and the apps wait for it. Keep the last
few tags in ghcr and the last week of images on the server (housekeeping keeps
7 days) so rollback never needs a rebuild.

## Backups

Nightly at 03:00 (`apps-backup.timer`, script `ansible/files/backup.sh`):

1. `pg_dump -Fc` + `pg_dumpall --globals-only` (the roles live there)
2. tar of the `assets-data` volume (uploads)
3. `manifest.txt` with image tags and `SHA256SUMS`
4. one `age`-encrypted archive per run in `/var/backups/apps`, 3 kept

The workstation **pulls** the archives over WireGuard (`ansible/files/pull-backups.ps1`
on Windows, `pull-backups.sh` for WSL/Git Bash, keep 7) -- the server holds no
credentials for the workstation.
Freshness is exported as a metric (`apps_backup_last_success_timestamp_seconds`)
and alerts after 36h; the pull script warns locally when the newest copy is
stale.

### Restore drill (quarterly)

On the workstation, from a pulled archive:

```sh
age -d -i ~/.age/key.txt apps-<stamp>.tar.gz.age | tar xz
docker compose -f compose.prod.yaml --env-file .env.restore -f compose.restore.yaml up -d postgres
docker compose ... exec -T postgres psql -U "$POSTGRES_MIGRATOR_USER" -d "$POSTGRES_DB" < globals.sql
docker compose ... exec -T postgres pg_restore -U ... -d "$POSTGRES_DB" --clean database.dump
# extract media.tgz into the assets volume, then start the rest and click
# through Studio and the sites
```

A backup that was never restored is a hypothesis, not a backup.

## Housekeeping

Weekly, Sunday 04:00 (`apps-housekeep.timer`):
images older than 7 days pruned (fresh ones stay as rollback candidates),
dangling containers/volumes pruned, journald vacuumed, disk usage reported to
the journal. Security updates run automatically (unattended-upgrades); a full
`apt upgrade` is part of the quarterly drill.

## Engineering gates

Changes to `web/` and `services/` run formatting, linting, type checking and a
production build; changed migrations get validated and container inputs get a
build check. An all-projects build on the main branch catches mistakes in
affected-project detection. Generated code and lockfiles are reviewed like
source. A release records source revision, image tag, migration version and
verification result.

## Testing

Unit tests cover domain rules, validation, transformations, state transitions
and permission decisions. Integration tests run against real PostgreSQL:
empty-database migration, constraints, authorization at server boundaries,
outbox creation alongside the domain write, duplicate submissions. End-to-end
suites and staging environments are deliberately deferred at this scale
([migration.md](migration.md)). Tests never send live email or touch production.

## Security baseline

Secure HTTP-only same-site cookies; CSRF protection on state-changing requests;
authorization enforced server-side per site and capability; public forms
validated and rate-limited; output escaped by default and rich content
sanitized narrowly; uploads validated by bytes and dimensions and stored away
from executable paths; secrets only in the vault; logs redacted (no passwords,
tokens, message bodies, personal form data); security headers at the proxy.
Before launch, document for every form what is collected, its purpose,
recipient, retention and deletion — Swiss requirements reviewed with a
qualified person.

## Runbooks

Concise runbooks before the first launch: deploy/verify · roll back · recover a
failed migration · restore · rotate a secret · editor account lifecycle ·
missing message · unavailable site · TLS change · add a domain · delete
personal data or an asset · decommission. Each states prerequisites, scope,
validation, rollback and escalation; destructive commands verify their target.
The deploy, backup, restore and housekeeping runbooks live here and in
`infrastructure/README.md`.

## Monitoring and alerting

Stack: prometheus, node-exporter, cAdvisor, blackbox-exporter, alertmanager,
grafana (`compose.monitoring.yaml`). Coverage:

| signal | source |
| --- | --- |
| host (cpu, memory, disk) | node-exporter |
| containers (cpu, memory, restarts) | cAdvisor |
| sites and postgres answering | blackbox probes on the internal network |
| certificate expiry | blackbox https probes |
| backup freshness | textfile metric written by the backup script |

Alert rules live in `infrastructure/monitoring/alerts.yml`; each one maps to
an action. Alerts go to **ntfy**: the `alertmanager.yml` webhook URL is
replaced from the vault (`vault_ntfy_webhook_url`), so every alert (and
recovery) becomes a push on your phone.

Setting it up once:

1. Pick an unguessable topic name, e.g. `oliumbi-alerts-<random>`.
2. Subscribe to it in the ntfy app (iOS/Android) or web app.
3. Optional hardening: enable topic protection in the app and use
   `https://:tk_<token>@ntfy.sh/<topic>` as the webhook URL, so only you can
   publish to it.
4. Put the URL in the vault as `vault_ntfy_webhook_url`, redeploy the app
   role, and test: `curl -d "test alert" <topic-url>`.

Alerts arrive as the raw Alertmanager JSON body -- readable, but ugly; a tiny
formatter can prettify them later if it bothers anyone. Alternatives if ntfy
ever stops suiting: email via the existing SMTP creds, or a Telegram bot
(both are `alertmanager.yml` swaps).

Grafana dashboards are imported on demand
(node-exporter id 1860, cAdvisor id 14282); only the datasource is provisioned
as code.

Known gap: everything above runs **on** the box it monitors. An external
"are the sites up" check (and a dead-man's switch for the box itself) is
tracked in open-work.
