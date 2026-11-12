# Open work

The actionable checklist. Only unresolved work lives here; remove or check off an
item when it resolves, with a short parenthetical status note. Known structural
debt is in [technical debt](tech-debt.md), not here. Directions and open
questions are in [decisions](../reference/decisions.md).

## How to use

- One item is one outcome a person can finish. If it needs a decision first, put
  it under **Owner decisions** and record the decision in
  [decisions](../reference/decisions.md).
- A code-complete item that still needs an environment check stays open as
  `[verify]`; owner-executed evidence stays `[owner]`. Do not remove an item
  because the code landed. The 2026-11 pass is code complete for the DR/RV
  findings and the P1/P2 debt; only the evidence is outstanding. Record the
  evidence in the [go-live checklist](../operations/checklists/go-live.md).
- The launch gate is the union of this page's **Launch gate** section, every P1
  item in [technical debt](tech-debt.md), deployment blockers DR-04–DR-07 and
  go-live findings RV-01–RV-04. The DR/RV items are code complete; their
  remaining work is real-host verification.
- The clean-host execution order, package ownership and acceptance evidence are
  in the [first go-live remediation plan](go-live-remediation-plan.md).

## Launch gate

- [ ] [verify] Replace development secrets and enable secure Studio cookies.
  (`STUDIO_SECURE_COOKIES=true` is in the Studio unit and no secret is
  committed; production secrets and real-role permissions remain owner-executed.)
- [ ] [verify] Verify domains, TLS, public URLs, sender DNS and SMTP delivery on
  the real host.
- [ ] [verify] Confirm the backup timer and the workstation pull work on the
  rebuilt server, and complete a restore on the dedicated machine
  ([backup and restore](../operations/backup-restore.md)).
- [ ] [owner] Generate the backup recovery identity, keep the passphrase-wrapped
  key in the password manager and print the recovery sheet; restore from the
  printed sheet in the drill
  ([key handling](../operations/runbooks/backup.md#key-handling-once-then-treat-it-as-done)).
- [ ] Close every P1 item in [technical debt](tech-debt.md) - currently TD-14
  only - or record the owner's explicit acceptance.
- [ ] [verify] Check site permissions and unpublished content with real roles.
  Provision the production roles after `apps-migrate` and verify each service
  connects with its own role; verify application checks on shared media and
  queues.
- [ ] [verify] Deploy health checks, alerts and useful logs, and confirm an alert
  reaches the phone ([monitoring](../operations/monitoring.md)).
- [ ] [owner] Approve final content, photos and legal pages. The legal, wording
  and founding-year decisions are resolved; real photos and final content assets
  remain owner-executed. Redirects are declined for now (D34); the legacy
  inventory remains (PH-10). Sign the claim inventory in
  [content verification](content-verification.md) before publishing.
- [ ] [verify] Run the environment integration pass: publishing, forms,
  reservations, login, email, and one service outage. Retry a public submission
  and confirm it returns the original outcome with no duplicate row, stock
  movement or email. Hide unfinished features. Oliumbi is a static placeholder
  on `:8004`; it is no longer a launch blocker.

## Build and deployment review (2026-11)

Evidence, commands and detail:
[deployment review](../history/deployment-review-2026-11.md).
DR-01 (wrapper permission), DR-02 (Quadlet count) and DR-03 (assets image) were
fixed during the review. DR-04 to DR-20 are code complete in the 2026-11 pass -
verify on the real host; the remaining work is real-host verification, not
implementation.

- [ ] [verify] **DR-04** Production roles are provisioned from the vault after
  `apps-migrate` and before the services start, with a per-role login check.
  Verify on the host that each service connects with its own role.
- [ ] [verify] **DR-05** `/apps` is traversable and monitoring configs are
  readable by the actual container users; `alertmanager.yml` stays
  `root:65534 0640`. Verify Prometheus and Alertmanager load their config.
- [x] **DR-06** Make the deploy tag explicit. (`image_tag` has no default and
  `latest` is rejected by the app role.)
- [ ] [verify] **DR-07** `studio.*` and `admin.*` names are in `dyndns_records`
  for every domain. Create the records once in Infomaniak and verify resolution
  after the timer runs.
- [ ] [verify] **DR-08** The outer archive is written to a file, verified with
  `tar tzf`, encrypted to a temporary name and renamed only after `age`
  succeeds; checksums are relative. Inject a failing stage in the restore drill
  and confirm no success metric is written.
- [x] **DR-09** Housekeeping no longer runs a blanket `volume prune`; named
  monitoring volumes are preserved.
- [ ] [verify] **DR-10** Application and monitoring units/env files use separate
  handlers. Verify that a monitoring change restarts the affected container on
  the host.
- [x] **DR-11** Secrets are safely rendered: `DATABASE_URL` carries no
  credentials, passwords are separate environment values, and secret templates
  use `no_log`.
- [x] **DR-12** The Studio route accepts 55 MB; public site routes keep the 10 MB
  limit.
- [ ] [verify] **DR-13** CI now builds every image without pushing. Verify the
  first CI image run is green.
- [x] **DR-14** Base/tool images, CI actions, the Caddy plugin and `ansible-core`
  are pinned by digest, commit SHA or exact version.
- [x] **DR-15** `sudo` is installed with the base packages, so the documented
  privilege method exists on a minimal Debian image.
- [ ] [verify] **DR-16** WireGuard-bound monitoring units declare `Wants=`/`After=`
  on `wg-quick@wg0.service`; verify a reboot still binds their published
  addresses.
- [x] **DR-17** Backup and housekeeping schedules are templated from
  `backup_hour`, `housekeep_hour` and `housekeep_day`.
- [ ] [verify] **DR-18** TLS probes target Caddy internally with per-site SNI and
  `Host`, so they do not need NAT hairpin. Verify `probe_ssl_earliest_cert_expiry`
  series exist on the host.
- [ ] [verify] **DR-19** The WireGuard-only sshd drop-in is removed when
  `restrict_ssh` is false. Verify a flip both ways remains reversible.
- [x] **DR-20** Grafana dashboards are documented as manually imported; only the
  Prometheus datasource is provisioned as code, and the volume comment says so.
  (superseded 2026-11: dashboards are now provisioned from git.)

## First go-live review (2026-11)

Evidence: [first go-live review](../history/go-live-review-2026-11.md).
Sequencing and acceptance criteria:
[first go-live remediation plan](go-live-remediation-plan.md).
All four findings are code complete in the 2026-11 pass - verify on the real
host.

- [ ] [verify] **RV-01** Node-exporter's host systemd collector is enabled and
  wired (dbus socket, `/run/systemd`, start-time metrics). Verify
  `node_systemd_unit_state` and `node_systemd_unit_start_time_seconds` exist on
  the real host, then fire `UnitFailing` and `UnitRestartLoop` as tests.
- [ ] [verify] **RV-02** `BackupStale` alerts on an absent success metric as well
  as a stale one, and the node-exporter textfile is published atomically. Test
  before the first backup and after an injected backup failure.
- [ ] [verify] **RV-03** Pre-cutover is the safe default: `dyndns_enabled` is
  false, only the timer unit is installed, and live updates require the explicit
  cutover run (`-e dyndns_enabled=true`). Verify a parallel `site.yml` cannot
  change live DNS.
- [ ] [owner] **RV-04** The cutover runbook defines the first durable public
  write as the point of no return. After it, export/replay the new writes or roll
  forward; a DNS-only rollback is not data-safe. Owner sign-off and the
  observation window must be recorded in the cutover rehearsal.

## Infrastructure and operations

Deployment shape: ghcr images pinned by tag, systemd units from
`infrastructure/units/` (podman/Quadlet), caddy with DNS-01 wildcards
(Infomaniak), manual deploys over WireGuard. Context:
[architecture](../architecture/README.md),
[infrastructure/README.md](../../infrastructure/README.md).

- [ ] [owner] Cutover from `legacy/`: freeze writes, final `pg_dump` (Postgres
  17), restore into Postgres 18, flip routing and explicitly enable dyndns.
  Migrations end at V011 (V007 intentionally unused, V008 Jublawoma, V009
  Uncle-T, V010 Zelglihof and V011 analytics; the monitoring role is in V001);
  the baseline freezes at the first accepted import. Delete the retired `api.*`
  DNS records. Follow [migration](migration.md#cutover-playbook).
- [x] Check whether 5432/8080/8000 on the current server are reachable from the
  internet (legacy exposure). (checked 2026-11-11 - not reachable; the new stack
  also has no host firewall by design, so keep verifying that only 80/443 and
  UDP 51820 (WireGuard) are forwarded.)
- [ ] [verify] Bootstrap the server in the new deployment shape:
  `ansible/playbooks/site.yml -e image_tag=<tag>` on Debian stable (podman >= 5
  with the Quadlet generator), vault and WireGuard keys in place. Roles are
  provisioned from the vault after migrate. Verify the units start in dependency
  order, `deploy.yml -e image_tag=<tag>` deploys and rolls back,
  `status.yml`/`logs.yml` work, and `backup.sh` produces an archive. Run
  `first-admin.yml --ask-vault-pass` once. A restore playbook is still missing;
  restore is a manual runbook until the drill.
- [ ] [verify] Backups are scripted (`ansible/files/backup.sh`, nightly timer):
  confirm the timer runs on the server and the workstation pull
  (`pull-backups.sh`) receives the archive.
- [ ] [verify] Install the workstation pull as a Task Scheduler job
  ([backup](../operations/runbooks/backup.md#pull-to-the-workstation)), record one
  real pull, and confirm the stale warning on an old copy. The server cannot
  alert on an off-host copy; the external dead-man check covers that gap.
- [ ] [owner] Restore drill on its own machine (D14): rebuild from zero and
  restore a pulled backup (globals, `pg_restore`, media tar), verify relative
  checksums, re-issue Caddy certificates, then walk Studio and every site. The
  preferred target is the not-yet-live replacement host after a meaningful import
  rehearsal, while legacy remains live; no third host is needed for that drill.
  The workstation drill is retired with the compose files. The draft procedure is
  in [restore](../operations/runbooks/restore.md).
- [ ] [verify] Housekeeping timer is scripted (`ansible/files/housekeep.sh`):
  confirm it runs on the server and check the first journal output.
- [ ] [verify] WireGuard config is templated (server role). Verify provider
  console/KVM recovery first, then set `restrict_ssh: true` so sshd only listens
  on the tunnel; confirm the drop-in is removed when it is false again.
- [ ] [verify] Create the A records listed in `dyndns_records`
  (`ansible/group_vars/all.yml`) once in the Infomaniak manager, including
  `studio.*`/`admin.*` and `vpn.oliumbi.ch` for the laptop's WireGuard endpoint.
  The dyndns timer only updates existing records and stays disabled before
  cutover.
- [ ] [verify] Create the ntfy alerting topic, subscribe in the phone app and
  store the webhook URL in the vault (`vault_ntfy_webhook_url`); steps in
  [monitoring](../operations/monitoring.md#setting-up-ntfy).
- [ ] [verify] Deploy the monitoring stack (`apps-prometheus` ... `apps-grafana`)
  and confirm alerts reach the phone. Then add external uptime checks and a
  dead-man's switch outside the box: everything current runs on the machine it
  watches.
- [x] Anonymous first-party page counting (revisit O-016 "No analytics").
  (implemented in PH-6 - one route-id beacon per navigation into
  `analytics.view_daily`, a per-site Studio panel, no cookies or identifiers;
  decision D25.) All four public sites are tracked; each tracked page carries
  the disclosure inline, including Oliumbi's placeholder.
- [ ] Explore error tracking so failures surface without a user report:
  frontend JS errors and Java `errorId`s currently end in journald with no
  aggregation. Weigh a self-hosted option (GlitchTip or similar) against
  O-016's minimal-embeds stance.
- [x] Expose Java service metrics to Prometheus. (implemented in PH-7 -
  Micrometer endpoints on identity, messaging and assets, queue gauges and
  oldest-pending age, Caddy edge metrics, postgres_exporter as the read-only
  `monitoring` role, and the service/pool/queue/connection alert rules.) The
  first Grafana dashboards for those series are provisioned as code; extend
  them after the metric names are confirmed on the host.
- [ ] Decide on Caddy access logging: the Caddyfile has no `log` directive,
  but [monitoring](../operations/monitoring.md) implies short-retention access
  logs exist. Either enable them (they remain the forensic record; usage
  counting no longer depends on them) or correct the doc.
- [x] Dependency and secret scanning. (implemented in PH-12 - `gitleaks` on
  every change, report-only `trivy fs` on pull requests, blocking weekly
  `security.yml` with Trivy and `pnpm audit --prod`; the manual image scan is
  part of the monthly checklist in [versions](../reference/versions.md).) The
  first remote security run is the remaining evidence.
- [ ] Monthly: refresh the pinned image digests and action SHAs
  (D24, DR-14) - all Dockerfile `FROM` lines, the CI container pins in
  `ci.yml` and the `publish.yml` action SHAs. The full register with owning
  files and the procedure is [versions](../reference/versions.md). Runtime
  version bumps (Caddy, Node, temurin) stay deliberate, separate bumps; this
  refresh only picks up silent base rebuild fixes. (Last refreshed 2026-11-12;
  held majors are listed in the register.)

## Product features

- [x] Improve image selection and previews in Studio. (resolved 2026-11 - the
  image field is a picker with thumbnails, pagination and inline upload)

Remaining product features are deliberately deferred until after launch; see
[Later](#later).

## Design and accessibility

- [ ] Jubla: check final illustrations and long titles on small phones.
- [x] Uncle-T: use one form of address throughout the site. (resolved in the
  W3-B pass - Sie -> Du across site and catalog)
- [ ] Zelglihof: use real farm photos. (placeholder farm counts and crop names
  remain owner-executed; see Z-04 in the
  [refactoring handoff](../history/refactoring-web-sites.md))
- [ ] Studio: simplify mobile lists. (Unsaved-edit protection landed as TD-09,
  resolved 2026-11; the list navigation itself is still a design task.)
- [x] Oliumbi: finish the placeholder's rough edges. (implemented in PH-11 -
  `robots.txt`, a sitemap, branded 404 and error boundaries, and a file check
  regression test.)
- [ ] Check keyboard use, focus, contrast and mobile menus. Verify German
  customer sites and Studio translations. The agreed high-value set is
  implemented (skip link and `main` target on every shell, focus after a
  successful Zelglihof submission, focus-visible styles on Jublawoma and Studio,
  Studio reduced motion; field errors use the shared field description wiring).
  Lighthouse accessibility is 100 on the Uncle-T inquiry, Jublawoma join,
  Zelglihof contact and Oliumbi home pages (2026-11). A 390px overflow audit is
  clean across the static pages of all four sites, including the long German
  legal headings. Remaining: the manual keyboard, contrast, mobile-menu and
  translation pass.
- [x] Contrast follow-up (2026-11 audit): Studio file-input, button and
  filter-chip borders, Zelglihof secondary CTA outlines, the Jublawoma success
  token and the Oliumbi skip-link focus ring are fixed. The remaining items are
  decorative or owner-gated.

## Owner decisions

- [x] Uncle-T: inquiry fields, phone-only replies, statuses and reviews are
  confirmed; there is no Google reviews embed.
- [x] Zelglihof: current contact fields, products, quantity limits, pickup
  statuses, reservation windows and display-only CHF price wording are
  confirmed. Real product data and photos remain owner-executed.
- [ ] [verify] Jubla: confirm annual dates, same-day event endings, calendar/PDF
  exports, group names and donation units with the second developer.
- [ ] [verify] Mail identities: the code now defaults to
  `newsletter@zelglihof-maegenwil.ch` plus the requests inbox (`hof@`) and the
  newsletter/requests split is implemented. Confirm the provider SMTP may send
  as both addresses and that the mailboxes exist; deliverability is provider
  evidence, not code.
- [x] Content review (2026-11), Jubla: the club's founding year. The rewrite's
  hero eyebrow claim "seit 1981" had no source in legacy or jubla.ch and was
  removed; no unverified founding year is published.
- [x] Content review (2026-11), legal: the dropped paragraphs are restored -
  Jubla Impressum (Haftungsausschluss including the links disclaimer and the
  "Quelle: SwissAnwalt" credit), the Uncle-T Disclaimer block, and the Uncle-T
  AGB clauses on cleaning and on insurance/permits.
- [x] Content review (2026-11), wording: the owner's decisions are applied - the
  invented three-step join process is removed, partner descriptions and the
  Uncle-T delivery offer are restored, "Beitreten" and "Spende" are kept (the
  "Mitmachen" and "Zusage" rebrands are reverted).
- [ ] [owner] Review the rewritten Uncle-T privacy text and the condensed AGB;
  no code change until the review lands.
- [x] [owner] Choose the Instagram and Google reviews direction. (resolved
  2026-11: showcases replace the old Instagram feed, and Uncle-T links to Google
  rather than embedding reviews; D36.) The claim sign-off stays in the launch
  gate.
- [ ] [owner] Collect the "detailed notes will follow" legacy site restructuring
  notes and fold them into [sites](../reference/sites.md) and the migration
  inventory.

## Later

- [x] Add Grafana dashboards for the service, queue, edge and Postgres series as
  code once the metric names have settled on the host. Dashboards stay manual
  imports and are not backed up. (implemented 2026-11: `apps-overview` and
  `host-and-data` are provisioned from git; verify the metric names on the
  host.)

- [x] Strengthen `AccountServiceTest`: it has two tests for a nine-method
  service and mocks `PasswordService`, so `changePassword` could store a bad
  hash and still pass; create/update conflicts and `isAvailable` self-exclusion
  are untested. Use a real `PasswordService` for the password path. (resolved
  2026-11 - nine tests, real BCrypt encoder, create/update/profile conflicts and
  self-exclusion covered; `mvn test` green.)
- [x] Decide whether correcting a subscriber to their own current address should
  be a no-op. (resolved in PH-3 - a same-address correction writes nothing and
  sends nothing; Studio distinguishes unchanged, confirmation-sent and
  unsubscribed corrections.)
- [ ] After launch by the go-live plan: connect notifications to users with site
  access. Choose event names and initial subscribers.
  `studio.account_notification` has no event catalog or dispatch contract yet.
- [ ] After launch by the go-live plan: show campaign delivery results per
  recipient. Agree retry rules for failed and uncertain sends.
- [ ] After launch by the go-live plan: add allowed senders per site and
  `List-Unsubscribe` headers. The `replyTo` contract field and the
  `*_REQUESTS_EMAIL` / `*_NEWSLETTER_EMAIL` split are implemented. Set retention
  rules for messages, tokens and personal data.
- [ ] After launch by the go-live plan: clarify image publication and retention
  when linked content outlives an image.
- [ ] Wire public document retrieval when a site needs it: the assets service
  implements `GET /documents/{slug}`, but no site proxy or edge route consumes
  it yet; current PDFs are static files. Alternatively remove the unused public
  path and keep only the management API.
- [ ] Replace the static Oliumbi placeholder with real content when it exists;
  the placeholder site and apex route are built.
- [ ] Translate the remaining hard-coded labels and content in Studio and the
  public sites. (2026-11 audit: the public sites are clean after fixing the
  Zelglihof email/phone placeholders, and the Studio section vocabulary, page
  titles, slug-field and asset labels now use the catalog. Remaining: English
  schema validation messages that reach the editor, the `gelöscht` edge labels,
  audit action codes/summaries, message status labels, and the Zelglihof
  transactional email copy.)
- [x] Paraglide URL translation (`/kontakt`, `/produkte`, ...). (implemented in
  PH-9 - German public paths via `urlPatterns`, English route ids, sitemaps
  updated; `i18n-urls` test pins the mapping.) The remaining hard-coded TSX
  labels are tracked separately.
- [ ] Revisit queued newsletter cancellation and stale confirmation links as
  volume grows. Current priority is low.
- [ ] Add email verification and password recovery only if public accounts are
  introduced; Studio is excluded.
- [ ] Replace the `caddy-ratelimit` commit pin with a release tag once upstream
  tags something newer than `5625512f` (the `v0.1.0` tag predates Caddy 2.10 and
  lacks the config-reload fix).
- [x] Admin audit trail for destructive and administrative actions.
  (implemented in PH-4 - append-only `studio.audit_event` with actor, action,
  entity and site, a read-only Studio view for administrators, and the scope
  recorded in [decisions](../reference/decisions.md). Retention is part of the
  housekeeping package.)
- [ ] Explore a personal-data export (subscribers, submissions) for Studio,
  alongside the retention-rules item above; both are revDSG/GDPR hygiene.
