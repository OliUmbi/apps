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
  Caddy access logs contain IP addresses; the short retention window is accepted
  at this scale.
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
| backup freshness and size | textfile metrics from `backup.sh` |

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
action:

| Alert | Meaning | First action |
| --- | --- | --- |
| `SiteProbeFailing` | a site is not answering for 5 minutes | check caddy and the site unit; see [runbooks](runbooks.md#site-unavailable) |
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

## Edge policy: rate limiting and CSP

Rate limiting and the Content-Security-Policy are edge behaviour, not metrics.
After an edge change:

- confirm the CSP header with `curl -I https://<site>/` and load one page with
  every embed the site uses;
- burst more than 20 requests in two seconds from one address and confirm a 429,
  then confirm login is limited to 10 per minute on `/api/session/login`;
- read Caddy logs for rejected requests. There is no CSP report endpoint or
  alert; a broken policy shows up as a browser error or a missing asset.

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

Grafana is reachable at the server's WireGuard address on port 3000. Only the
Prometheus datasource is provisioned as code from
`infrastructure/monitoring/grafana/provisioning/`. Dashboards are imported by
hand (node-exporter dashboard id 1860) and live in the `data-grafana` volume,
which is deliberately not backed up. Recreate them after a volume loss; the
volume comment and [housekeeping](housekeeping.md#what-not-to-clean) say so.

## Known gap: the monitor watches itself

Everything above runs on the machine it monitors. An external "are the sites up"
probe and a dead-man's switch for the host are not in place yet
([open work](../work/open-work.md)). Until then, treat a missing expected alert
as suspicious, not reassuring: if the host is down, ntfy will not tell you.
