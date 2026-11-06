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
- **Upgrade path.** If you regularly grep across five containers, add Loki and
  query from Grafana. Not needed now.

## Metrics and alerts

Stack: `apps-prometheus`, `apps-node-exporter`, `apps-blackbox`,
`apps-alertmanager`, `apps-grafana` (units in `infrastructure/units/`). Config
lives in `infrastructure/monitoring/`.

| Signal | Source |
| --- | --- |
| host CPU, memory, disk | node-exporter |
| units failing or restart-looping | node-exporter systemd collector |
| sites and postgres answering | blackbox probes on the internal network |
| certificate expiry | blackbox HTTPS probes |
| backup freshness and size | textfile metrics from `backup.sh` |

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
| `BackupStale` | no successful backup in 36 hours | run `backup.yml`, read the backup journal |
| `CertificateExpiringSoon` | a certificate expires within 14 days | check caddy ACME logs and DNS |

Alerts and recoveries go to an **ntfy** topic as a push notification. The
webhook URL lives in the vault as `vault_ntfy_webhook_url` and is rendered into
`alertmanager.yml`.

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
Prometheus datasource is provisioned as code; dashboards are imported on demand
(node-exporter dashboard id 1860).

## Known gap: the monitor watches itself

Everything above runs on the machine it monitors. An external "are the sites up"
probe and a dead-man's switch for the host are not in place yet
([open work](../work/open-work.md)). Until then, treat a missing expected alert
as suspicious, not reassuring: if the host is down, ntfy will not tell you.
