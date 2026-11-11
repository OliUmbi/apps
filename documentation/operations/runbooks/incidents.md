# Incidents

**When:** an alert fires, a site or the admin app is unreachable, mail is not
delivered, or the host is suspect. The signal map and alert table are in
[monitoring](../monitoring.md#metrics-and-alerts).

## How to work an incident

1. Read the alert table first; it names the first action for every rule.
2. Triage outward: **host/tunnel → Caddy → PostgreSQL → one service/site**.
   If every site fails together, the shared layer is the cause.
3. Restore service before investigating when the two conflict. Do not delete
   durable state or "refresh" certificates to make a symptom disappear.
4. Reach the host over WireGuard; if the tunnel is down, use physical recovery.
5. After recovery, record the cause and the follow-up in
   [open work](../../work/open-work.md) or [technical debt](../../work/tech-debt.md).

## Site unavailable

**Symptom:** `SiteProbeFailing`, a browser error, or a timeout.

1. `status.yml`, then `logs.yml -e service=<site>` for the affected unit.
2. **Caddy down:** HTTP and TLS fail for every site. Restart caddy and read its
   journal.
3. **One site down:** restart that unit; if it loops, read the first error and
   check the last deploy tag.
4. **PostgreSQL down:** sites fail together; follow below.
5. **Host unreachable:** the tunnel and monitoring are also down; use physical
   recovery.

## PostgreSQL not answering

**Symptom:** `PostgresNotAnswering` or every site failing at once.

1. Check the `apps-postgres` unit and disk.
2. Read its log. A data-directory permission or disk-full error is not fixed by
   restarting.
3. If it restarts cleanly, verify a read and a write, then every site.
4. If data is corrupt, stop and restore into a separate database before switching
   traffic ([restore](restore.md)).

## Disk filling up

**Symptom:** `DiskFillingUp` or `df` above the threshold.

1. `status.yml` and `df -h /`.
2. Run housekeeping ([maintenance](maintenance.md#weekly-housekeeping)).
3. Find the large directory: images, journald, postgres or media. Do not delete
   durable state to make room.
4. If the backup directory is large, verify the workstation pull first, then
   reduce the server retention deliberately.
5. Record why it filled; a recurring cause is a missing rotation or an oversized
   upload.

## Missing message

**Symptom:** a form was accepted but no email arrived; `MessageFailed` or
`QueueStalled` fired.

1. Check Studio delivery history for the site and time window, and
   `GET /message/{id}` if the id is known.
2. If a delivery row exists, read its attempts (`SENT`, `RETRY`, `FAILED`,
   `REJECTED`) with the structured detail.
3. If no row exists, the producer transaction did not commit the queue insert.
   Check the site logs and the durable form row; a committed form without a queue
   row is a bug, not a mail problem.
4. For `FAILED`, inspect the SMTP detail (configuration, auth, recipient). There
   is no admin retry endpoint; a controlled re-queue uses the original request
   UUID.
5. Never resend blindly: an ambiguous send may already have reached the
   recipient.

## Queue intake stalled

**Symptom:** `QueueIntakeStalled` — an inbox row has not been taken up for 30
minutes.

1. Read the messaging journal; the worker logs each skipped row with its cause.
2. A poisoned row is retried on a later poll and must not be deleted; housekeeping
   never expires it.
3. If the worker is down, `QueueStalled` likely fires too; restart the unit and
   confirm the backlog drains.
4. A row that keeps throwing is a bug: capture the payload id and open a work
   item; do not delete the row to silence the alert.

## TLS or certificate problem

**Symptom:** `TlsProbeFailing` or `CertificateExpiringSoon`.

1. Read caddy logs; distinguish an ACME/DNS failure from a serving problem.
2. Verify the Infomaniak token and the DNS records (`dyndns` logs). The timer is
   disabled before cutover; enable it only in the cutover run.
3. Never delete `/var/lib/apps/caddy-data` on a running host.
4. If the state is lost on a rebuilt host, re-issue through DNS-01
   ([edge](edge.md#certificate-re-issuance)).
5. After a fix, confirm the chain and expiry with an HTTPS probe.

## Alert channel or monitoring down

- `ServiceDown`, `ScrapeTargetDown` or `ProbeSeriesMissing`: check the monitoring
  units and their journals; a silent monitor is an incident, not reassurance.
- ntfy not receiving: test the webhook URL from the vault
  ([monitoring](../monitoring.md#setting-up-ntfy)). The box cannot alert about
  its own total failure; external uptime/dead-man coverage is tracked in
  [open work](../../work/open-work.md).

## Stop rules

- Do not delete or move `/var/lib/apps/postgres`, `media`, `caddy-data` or
  `caddy-config`.
- Do not restart `apps-migrate` by hand; deploy instead.
- Do not start the application units against a partial or unverified database.
- Do not edit production rows to compensate for a content bug; fix the source.
