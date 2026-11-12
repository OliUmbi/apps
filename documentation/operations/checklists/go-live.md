# Go-live evidence checklist

Run this on the real host and record the result. **Code complete is not done**:
an item is closed only when the evidence line is filled with a date, a person and
the observed output. The IDs map to [open work](../../work/open-work.md) and
[technical debt](../../work/tech-debt.md), so a failed check becomes a register
entry, not a note in a chat.

Use [setup](../runbooks/setup.md), [release](../runbooks/release.md), [backup](../runbooks/backup.md),
[restore](../runbooks/restore.md) and [incidents](../runbooks/incidents.md) for the procedures and the
exact commands. Copy this file to a dated record when the run starts, or fill it
in place and keep the commit.

## A. Host, deploy and roles

- [ ] **DR-04** Roles are provisioned after migrate and before the apps. Each
  service connects with its own role, not the migrator.
  Check: `deploy.yml` log shows one login per role; a wrong password fails.
  Evidence:
- [ ] **DR-05** `/apps` is traversable and monitoring configs are readable by the
  container users; `alertmanager.yml` is `root:65534 0640`.
  Check: Prometheus and Alertmanager start and load their config.
  Evidence:
- [ ] **DR-07** Every `studio.*` and `admin.*` name exists in Infomaniak and
  resolves. Pre-cutover the dyndns timer stays stopped.
  Evidence:
- [ ] **DR-13** The first CI `images` job is green (all ten images build).
  Evidence:
- [ ] **DR-16** WireGuard-bound units declare `Wants=`/`After=` on
  `wg-quick@wg0.service`; a reboot still binds their published addresses.
  Evidence:
- [ ] **DR-19** `restrict_ssh: true` binds sshd to the tunnel; setting it back to
  `false` removes the drop-in and SSH listens on all interfaces again.
  Evidence:
- [ ] **Setup exit** Every `apps-*` unit is active, every timer except dyndns is
  enabled, the first admin signs in, and only Caddy publishes public ports
  (monitoring binds to the WireGuard address).
  Evidence:
- [ ] **Privileges** The eight app containers run as their image's unprivileged
  `app` user (assets is pinned to uid 100) with `NoNewPrivileges`; the six
  monitoring containers also drop all capabilities and set `NoNewPrivileges`.
  Postgres runs as 70; Caddy and the migrator keep their image defaults, accepted
  by TD-23.
  Check: `podman inspect --format '{{.Config.User}}' <name>` and
  `podman exec <name> id`; `podman inspect <name> | grep -i no-new-privileges`.
  Evidence:

## B. Edge, secrets and security

- [ ] **Domains/TLS** Every public name serves over HTTPS with a valid
  certificate; `www`/`studio.*` redirects land on the right host.
  Evidence:
- [ ] **Studio cookie** `__Host-studio_session` with `Secure`, `HttpOnly` and
  `SameSite=Lax` over HTTPS; sign-out clears it.
  Evidence:
- [ ] **Headers** HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy` and the baseline CSP are present.
  Evidence:
- [ ] **Rate limits** More than 20 events in two seconds returns `429`; login is
  limited to 10 per minute; public bodies allow 10 MB and Studio 55 MB.
  Evidence:
- [ ] **Secrets** No development or placeholder credential is in use; env files
  are `0600 root`; the vault is the only source.
  Evidence:
- [ ] **SSH** Key-only authentication from the first run; the tunnel works from
  the LAN and from outside before lockdown.
  Evidence:
- [ ] **Mail** The provider sends as every configured identity; SPF/DKIM/DMARC
  and the request/newsletter split are confirmed; a real message arrives.
  Evidence:
- [ ] **Legacy exposure** 5432/8080/8000 on the legacy host are not reachable
  (checked 2026-11-11); only 80/443 and UDP 51820 are forwarded.
  Evidence:
- [ ] **PH-12** The first remote `security.yml` run is green, or the finding is
  recorded as accepted risk with a review date.
  Evidence:
- [ ] **DR-18** `probe_ssl_earliest_cert_expiry` series exist for every site and
  the certificate alert is wired.
  Evidence:
- [x] **Caddy access logging** Decision recorded: journald-only, no per-request
  access log (2026-11-13).
  Evidence: [monitoring](../monitoring.md#logging).

## C. Backup and recovery

- [ ] **Backup timer** The nightly timer runs on the server; the archive count
  and success metric are visible.
  Evidence:
- [ ] **Pull** The workstation pull receives the archive; the newest copy is
  fresh and the stale warning works.
  Evidence:
- [ ] **DR-08/RV-02** A failed backup stage leaves no new archive and no success
  metric; `BackupStale` fires for absent and for stale metrics; the textfile is
  published atomically.
  Evidence:
- [ ] **Recovery key** The recovery identity, passphrase and printed sheet exist;
  the sheet is stored where a second person can find it.
  Evidence:
- [ ] **Restore drill** The [drill record](restore-drill.md) is complete: a
  from-zero restore, checksums, row counts, media, certificates, Studio and every
  site.
  Evidence:
- [ ] **TD-14** The owner-led import rehearsal reconciles
  source/migrated/skipped/failed counts and media hashes; historical rows sent no
  notifications.
  Evidence:
- [ ] **Baseline** Flyway reports V011; the next change starts at V012 and the
  schema is ready to freeze.
  Evidence:

## D. Monitoring and alerting

- [ ] **Scrapes** Prometheus scrapes the three services, Caddy, postgres-exporter
  and node-exporter; all expected targets are `up`.
  Evidence:
- [ ] **RV-01** `node_systemd_unit_state` and
  `node_systemd_unit_start_time_seconds` exist; `UnitFailing` and
  `UnitRestartLoop` fire when tested.
  Evidence:
- [ ] **Absence** `ProbeSeriesMissing` and `ScrapeTargetDown` fire when the
  probe/exporter is stopped; a silent monitor is treated as an incident.
  Evidence:
- [ ] **Phone** A test alert reaches the phone through ntfy and clears.
  Evidence:
- [x] **Dead-man's switch** Owner accepted the gap for launch on 2026-11-13: no
  external uptime check or host dead-man's switch exists yet. Monitoring stays
  host-local, so a dead host is silent until that item is revisited.
  Evidence: [open work](../../work/open-work.md#infrastructure-and-operations)
  and [technical debt](../../work/tech-debt.md#accepted-limitations-not-debt).
- [ ] **Housekeeping** `HousekeepStale` and the success metric are verified; the
  first run is in the journal.
  Evidence:

## E. Authorization and content

- [ ] **Real roles** Site roles see only their site; unpublished content stays
  hidden; shared media and queues respect the role checks.
  Evidence:
- [ ] **Owner content** Final photos, product data, German wording and the legal
  pages are approved.
  Evidence:
- [ ] **Content claims** Every specific claim in
  [content verification](../../work/content-verification.md) is confirmed or
  removed; no stale membership number, duration, service area or capacity is
  published, and the Uncle-T Google link opens the correct listing.
  Evidence:
- [ ] **Owner confirmations** Jubla dates, same-day endings, exports, group names
  and donation units are confirmed; mailboxes and sender identities exist.
  Evidence:
- [ ] **Accessibility/translation** The agreed high-value set is implemented
  (skip links, `main` targets, focus rings, success focus, reduced motion);
  the manual keyboard, contrast, mobile-menu and translation pass is the
  remaining evidence.
  Evidence:

## F. Environment integration

- [ ] **Publishing** Create, edit and unpublish one page per site; a published
  item appears publicly and an unpublished one does not.
  Evidence:
- [ ] **Forms** Every public form accepts a valid submission, rejects invalid
  input, and the durable row plus queued email exist.
  Evidence:
- [ ] **Reservations** A reservation decrements stock atomically; a cancellation
  restores it once; an over-quantity request is refused.
  Evidence:
- [ ] **Login** Sign in, use one authorized action, sign out; a disabled account
  loses access immediately.
  Evidence:
- [ ] **Email** A real message arrives; a failed delivery is visible with its
  attempt detail; no blind resend was needed.
  Evidence:
- [ ] **Outage** Stop one service and confirm the site degrades as designed and
  recovers; check the matching alert.
  Evidence:
- [ ] **Replay** Repeat a public submission with the same submission id; it
  returns the original outcome with no second row, stock movement or email.
  Evidence:
- [ ] **Browser pass** Desktop and small-phone walk of every site and Studio,
  including the CSP-protected embeds.
  Evidence:

## G. Cutover readiness

- [ ] **RV-03** `dyndns_enabled` is false; a parallel `site.yml` run cannot change
  live DNS; the timer is installed but stopped.
  Evidence:
- [ ] **RV-04** The first durable public write is defined as the point of no
  return; the owner signs off the observation window and the replay/roll-forward
  plan.
  Evidence:
- [ ] **Rollback** The previous tag is recorded and schema-compatible; the
  release log has a rollback target.
  Evidence:
- [ ] **Observation** The cutover notes record the write boundary, the window,
  the owner and the decision.

## Sign-off

| Area | Checked by | Date | Result / notes |
| --- | --- | --- | --- |
| Host and deployment | | | |
| Edge and security | | | |
| Backup and recovery | | | |
| Monitoring and alerting | | | |
| Authorization and content | | | |
| Environment integration | | | |
| Cutover readiness | | | |

A failed item goes to [open work](../../work/open-work.md) (actionable) or
[technical debt](../../work/tech-debt.md) (structural) the same day. Do not record
a pass from a code review, a local build or a CI run alone.

