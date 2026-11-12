# Monitoring and logging

Metrics alert; logs explain. Everything runs on the same host, which is useful
for diagnosis and a known blind spot for host-level failure.

## Logging

- **One destination.** Every workload logs to stdout/stderr, which podman sends
  to journald. There is no container daemon and no per-container log file.
  Journald is capped at 200 MB, so disk use is bounded by design.
- **Read with the playbook.** `ansible-playbook playbooks/logs.yml -e service=<name>`
  wraps `journalctl -u apps-<service>`. Logs are for debugging and post-mortems;
  alerts come from metrics.
- **Never log** secrets, tokens, full request bodies or personal form data.
  Caddy does not emit access logs today (the Caddyfile has no `log` directive);
  whether to enable them is an open decision. Errors and application logs go to
  journald, capped at 200 MB.
- **Errors carry context** (what was attempted, ids, outcome), not a stack trace
  on every request. Java errors carry `errorId`; correlation ids are useful but
  not required everywhere yet.
- **Upgrade path.** If you regularly grep across every container, add Loki and
  query from Grafana. Not needed now.

## Metrics and alerts

Stack: `apps-prometheus`, `apps-node-exporter`, `apps-blackbox`,
`apps-alertmanager`, `apps-grafana` (units in `infrastructure/units/`). Config
lives in `infrastructure/monitoring/`.

| Signal | Source |
| --- | --- |
| host CPU, memory, disk | node-exporter |
| units failing or restart-looping | node-exporter systemd collector (host dbus) |
| sites and postgres answering | blackbox probes on the internal network |
| certificate expiry | internal blackbox HTTPS probes against Caddy |
| edge request rate, latency, 5xx ratio | Caddy admin metrics (`caddy:2019`) |
| service 5xx, Hikari pool, queue depth and age | Micrometer on identity, messaging and assets |
| connections, locks, database size | postgres_exporter as the read-only `monitoring` role |
| backup freshness and size | textfile metrics from `backup.sh` |
| housekeeping freshness | textfile metric from `housekeep.sh` |

The systemd collector is enabled with `--collector.systemd` and
`--collector.systemd.enable-start-time-metrics`, and the node-exporter unit
mounts `/run/dbus/system_bus_socket` and `/run/systemd` read-only. If
`node_systemd_unit_state` or `node_systemd_unit_start_time_seconds` is missing,
check those mounts first (RV-01). `UnitFailing` and `UnitRestartLoop` are only
meaningful when the series exist.

TLS probes connect to `https://caddy:443/` inside the app network with a
per-site module that sends the public hostname as SNI and `Host`. They do not
depend on router NAT hairpin (DR-18), and `probe_ssl_earliest_cert_expiry` still
reflects the public certificate.

Alert rules live in `infrastructure/monitoring/alerts.yml`. Each maps to an
action: the [incidents runbook](runbooks/incidents.md) turns a firing alert into
a procedure.

| Alert | Meaning | First action |
| --- | --- | --- |
| `SiteProbeFailing` | a site is not answering for 5 minutes | check caddy and the site unit; see [incidents](runbooks/incidents.md#site-unavailable) |
| `ProbeSeriesMissing` | a blackbox probe series disappeared | blackbox or the scrape is down; check the exporter unit |
| `ServiceDown` | a service stopped exposing metrics | `logs.yml` for that service |
| `ScrapeTargetDown` | Caddy or postgres_exporter stopped exposing metrics | check that unit and its journal; capacity alerts are blind without it |
| `TlsProbeFailing` | the TLS handshake or route fails | Caddy logs, DNS and the certificate state |
| `Edge5xxRate` | more than 1% of edge responses are 5xx | correlate with `Service5xxRate` and site logs |
| `Service5xxRate` | a service returns more than 1% 5xx | `logs.yml`, then [incidents](runbooks/incidents.md) |
| `DbPoolSaturated` | a service pool is above 90% | look for a slow query or a stuck request |
| `PostgresConnectionsHigh` | above 80% of `max_connections` | check pools and long transactions |
| `MessageFailed` | a message reached FAILED | inspect the attempt history in Studio; see [incidents](runbooks/incidents.md#missing-message) |
| `QueueStalled` | the oldest pending message is over 30 minutes old | check the messaging unit and SMTP reachability |
| `QueueIntakeStalled` | the oldest unconsumed email inbox row is over 30 minutes old | intake is not consuming; read the messaging journal (the row is never expired by housekeeping) |
| `PostgresNotAnswering` | postgres rejects connections | check the postgres unit and disk; do not restart blindly |
| `NodeExporterDown` | the host or exporter is unhealthy | check the host over WireGuard; this may be the host itself |
| `UnitFailing` | an `apps-*` unit is failed | `logs.yml` for that unit, then the relevant runbook |
| `UnitRestartLoop` | a unit restarted more than twice in an hour | read its logs and the last deploy tag |
| `DiskFillingUp` | root filesystem above 85% | run housekeeping, find the large directory, do not delete state blindly |
| `BackupStale` | no backup metric at all, or no success in 36 hours | run `backup.yml`, read the backup journal |
| `HousekeepStale` | no housekeeping success metric, or none in 8 days | run `housekeep.yml`, read the housekeeping journal |
| `CertificateExpiringSoon` | a certificate expires within 14 days | check caddy ACME logs, DNS and the vault token; re-issue rather than copy state |

`BackupStale` has an `absent()` branch, so a fresh host with no first backup is
covered as well as a stale one (RV-02). The backup script publishes its textfile
atomically and only after every stage succeeds.

Alerts and recoveries go to an **ntfy** topic as a push notification. The
webhook URL lives in the vault as `vault_ntfy_webhook_url` and is rendered into
`alertmanager.yml`.

The Caddy admin listener is bound to `:2019` inside the app network only; it
carries `/metrics` and is never published. The three services expose
`/actuator/prometheus` on the private network, and `postgres_exporter` connects
as the read-only `monitoring` role (`pg_monitor`): statistics are visible,
application rows are not.

## Edge policy: rate limiting and CSP

Rate limiting and the Content-Security-Policy are edge behaviour, not metrics;
their checks live in [security](runbooks/security.md#edge-checks) and their
change procedure in [edge](runbooks/edge.md#change-caddy-behaviour).

## Setting up ntfy

1. Pick an unguessable topic name, for example `oliumbi-alerts-<random>`.
2. Subscribe in the ntfy app (iOS/Android) or web app.
3. Optional hardening: enable topic protection and use
   `https://:tk_<token>@ntfy.sh/<topic>` as the webhook URL so only you can
   publish.
4. Put the URL in the vault as `vault_ntfy_webhook_url`, redeploy the app role.
5. Test: `curl -d "test alert" <topic-url>` and confirm the phone notification.

Alerts arrive as the raw Alertmanager JSON body. It is readable but ugly; a small
formatter can prettify it later if it becomes annoying. Alternatives are email
through the existing SMTP credentials or a Telegram bot; both are an
`alertmanager.yml` change.

## Grafana

Grafana is reachable at the server's WireGuard address on port 3000. Its
configuration is provisioned from git under
`infrastructure/monitoring/grafana/provisioning/`: the Prometheus datasource
(`datasources/prometheus.yml`, fixed uid `prometheus`), the dashboard provider
(`dashboards/dashboards.yml`) and one JSON file per dashboard
(`apps-overview.json`, `host-and-data.json`). A dashboard is a file, not a UI
object: change the JSON, deploy, and review the diff like any other code.
Ansible copies the files on each deploy and the unit mounts the directory
read-only at `/etc/grafana/provisioning`.

- **Apps overview** - site probes, certificate expiry, edge request rate, 5xx
  ratio and p95 latency, service request rate and 5xx, Hikari pools, messaging
  queue depth and oldest age.
- **Host and data** - CPU, memory, root disk, load, network throughput, and
  PostgreSQL up, connections, `max_connections` and database size.

The provider reads `/etc/grafana/provisioning/dashboards` into the `Apps`
folder and refuses UI edits (`allowUiUpdates: false`,
`disableDeletion: true`). Because deletion is disabled, retiring a dashboard is
manual: remove the JSON from git and from the host directory, then delete the
dashboard through the Grafana API. Deleting the file alone leaves the dashboard
in place, and deleting only the dashboard lets the next restart provision it
again. The `data-grafana` volume now only holds users and history, so losing it
costs history, not dashboards (it stays outside the backup on purpose).

## Known gap: the monitor watches itself

Everything above runs on the machine it monitors. An external "are the sites up"
probe and a dead-man's switch for the host are not in place yet
([open work](../work/open-work.md)). Until then, treat a missing expected alert
as suspicious, not reassuring: if the host is down, ntfy will not tell you.
