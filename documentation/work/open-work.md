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
  `[verify]`; do not remove it because the code landed.
- The launch gate is the union of this page's **Launch gate** section, every P1
  item in [technical debt](tech-debt.md), deployment blockers DR-04–DR-07 and
  go-live findings RV-01–RV-04.
- The clean-host execution order, package ownership and acceptance evidence are
  in the [first go-live remediation plan](go-live-remediation-plan.md).

## Launch gate

- [ ] Replace development secrets. Enable secure Studio cookies. Keep database
  and service ports private. Provision production role credentials after
  `apps-migrate` and verify each service connects with its own role.
- [ ] Verify domains, TLS, public URLs, sender DNS and SMTP delivery.
- [ ] Confirm the backup timer and the workstation pull work on the rebuilt
  server, and complete a restore on the dedicated machine
  ([backup and restore](../operations/backup-restore.md)).
- [ ] Close every P1 item in [technical debt](tech-debt.md) - currently TD-01
  and TD-14 - or record the owner's explicit acceptance.
- [ ] Check site permissions and unpublished content with real roles. Verify
  application checks on shared media and queues.
- [ ] Deploy health checks, alerts and useful logs, and confirm an alert reaches
  the phone ([monitoring](../operations/monitoring.md)).
- [ ] Approve final content, photos and legal pages. Add old URL redirects, page
  metadata and content sitemaps.
- [ ] Run the environment integration pass: publishing, forms, reservations,
  login, email, and one service outage. Retry a public submission and confirm it
  returns the original outcome with no duplicate row, stock movement or email.
  Hide unfinished features. Oliumbi is still missing.

## Build and deployment review (2026-11)

Evidence, commands and detail:
[deployment review](../history/deployment-review-2026-11.md).
DR-01 (wrapper permission), DR-02 (Quadlet count) and DR-03 (assets image) were
fixed during the review; the remaining items are open.

- [ ] **DR-04** Provision the production application roles from the vault after
  `apps-migrate` and before the services start; verify one connection per role.
- [ ] **DR-05** Make `/apps` traversable and monitoring configs readable by the
  actual container users; verify Prometheus and Alertmanager load config.
- [ ] **DR-06** Remove the `image_tag: latest` default; require an explicit
  pinned tag and reject `latest` in the deploy path.
- [ ] **DR-07** Add `studio.oliumbi.ch` and the intended `studio.*`/`admin.*`
  redirect names to the managed DNS records; verify resolution.
- [ ] Harden backup and housekeeping: make the remaining outer tar/encryption
  pipeline fail closed and remove blanket `volume prune` of unbacked monitoring
  state (DR-08, DR-09).
- [ ] Fix monitoring restarts, secret templating and the Studio upload body
  limit (DR-10, DR-11, DR-12). (DR-10: monitoring containers carry
  `Restart=always`; the deploy-path wiring for unit and env changes is still
  open)
- [ ] Make builds reproducible and verified before release: build images in CI
  and pin base/tool images, the Caddy plugin and the CI Ansible package (DR-13,
  DR-14). (Application and site images are digest-pinned; Flyway, Caddy, the
  plugin and the CI toolchain are not)
- [ ] **DR-15** Install `sudo` or make the bootstrap privilege prerequisite
  explicit and verified before relying on `become_method = sudo`.
- [ ] **DR-16** Order WireGuard-bound monitoring units after the tunnel so a
  reboot cannot race their published addresses.
- [ ] **DR-17** Template the backup/housekeeping schedules from their variables
  or remove the dead configuration.
- [ ] **DR-18** Verify public TLS probes through the router; use an internal
  Caddy probe with the correct host header if NAT hairpin is unsupported.
- [ ] **DR-19** Remove the WireGuard-only sshd drop-in when `restrict_ssh` is
  false and verify that lockdown remains reversible.
- [ ] **DR-20** Provision Grafana dashboards as code or correct the volume
  comment and document their deliberate manual restoration. (The unit comment
  and the manual-restoration docs are corrected; the `data-grafana.volume`
  comment still claims provisioning)

## First go-live review (2026-11)

Evidence: [first go-live review](../history/go-live-review-2026-11.md).
Sequencing and acceptance criteria:
[first go-live remediation plan](go-live-remediation-plan.md).

- [ ] **RV-01** Enable and wire node-exporter's host systemd collector. Verify
  `node_systemd_unit_state` and `node_systemd_unit_start_time_seconds` exist on
  the real host, then fire `UnitFailing` and `UnitRestartLoop` as tests.
- [ ] **RV-02** Alert when the backup success metric is absent as well as stale,
  and publish the node-exporter textfile atomically. Test before the first
  backup and after an injected backup failure.
- [ ] **RV-03** Add an explicit pre-cutover mode so `site.yml` on a parallel
  clean host cannot update live DNS. Keep router forwarding and live records on
  legacy until the final import and smoke tests; enable dyndns only at cutover.
- [ ] **RV-04** Define the cutover point of no return and how post-cutover writes
  are exported/replayed or rolled forward before any rollback to legacy. Do not
  switch DNS back in a way that silently strands accepted submissions.

## Infrastructure and operations

Deployment shape: ghcr images pinned by tag, systemd units from
`infrastructure/units/` (podman/Quadlet), caddy with DNS-01 wildcards
(Infomaniak), manual deploys over WireGuard. Context:
[architecture](../architecture/README.md),
[infrastructure/README.md](../../infrastructure/README.md).

- [ ] Cutover from `legacy/`: freeze writes, final `pg_dump` (Postgres 17),
  restore into Postgres 18, flip DNS. Decide whether the new migrations continue
  the legacy history or start fresh and map the data. Delete the retired `api.*`
  DNS records. Follow [migration](migration.md#cutover-playbook).
- [ ] Check whether 5432/8080/8000 on the current server are reachable from the
  internet (legacy exposure). The new stack has no host firewall by design, so
  verify only 80/443 and UDP 51820 (WireGuard) are forwarded.
- [ ] Bootstrap the server in the new deployment shape:
  `ansible/playbooks/site.yml` on Debian stable (podman >= 5 with the Quadlet
  generator), vault and WireGuard keys in place. Verify the units start in
  dependency order, `deploy.yml -e image_tag=<tag>` deploys and rolls back,
  `status.yml`/`logs.yml` work, and `backup.sh` produces an archive. A restore
  playbook is still missing.
- [ ] Backups are scripted (`ansible/files/backup.sh`, nightly timer): enable on
  the server and confirm the workstation pull (`pull-backups.sh`).
- [ ] Restore drill on its own machine (D14): rebuild from zero and restore a
  pulled backup (globals, `pg_restore`, media tar), then walk Studio and every
  site. The preferred target is the not-yet-live replacement host after a
  meaningful import rehearsal, while legacy remains live; no third host is
  needed for that drill. The workstation drill is retired with the compose
  files. The draft procedure is in
  [backup and restore](../operations/backup-restore.md#restore-untested-until-the-drill).
- [ ] Housekeeping timer is scripted (`ansible/files/housekeep.sh`): enable on the
  server and check the first journal output.
- [ ] WireGuard config is templated (server role). Verify provider console/KVM
  recovery first, then set `restrict_ssh: true` so sshd only listens on the
  tunnel.
- [ ] Create the A records listed in `dyndns_records`
  (`ansible/group_vars/all.yml`) once in the Infomaniak manager, including
  `vpn.oliumbi.ch` for the laptop's WireGuard endpoint. The dyndns timer only
  updates existing records.
- [ ] Decide where the `oliumbi.ch` apex routes: the new stack has no Oliumbi
  site yet (the Caddyfile placeholder redirects to Studio).
- [ ] Create the ntfy alerting topic, subscribe in the phone app and store the
  webhook URL in the vault (`vault_ntfy_webhook_url`); steps in
  [monitoring](../operations/monitoring.md#setting-up-ntfy).
- [ ] Deploy the monitoring stack (`apps-prometheus` ... `apps-grafana`) and
  confirm alerts reach the phone. Then add external uptime checks and a
  dead-man's switch outside the box: everything current runs on the machine it
  watches.

## Product features

- [ ] Connect notifications to users with site access. Choose event names and
  initial subscribers. `studio.account_notification` has no event catalog or
  dispatch contract yet.
- [ ] Show campaign delivery results per recipient. Agree retry rules for failed
  and uncertain sends.
- [ ] Add allowed senders per site and `List-Unsubscribe` headers. The `replyTo`
  contract field and the `*_REQUESTS_EMAIL` / `*_NEWSLETTER_EMAIL` split are
  implemented. Set retention rules for messages, tokens and personal data.
- [ ] Clarify image publication and retention when linked content outlives an
  image.
- [x] Improve image selection and previews in Studio. (resolved 2026-11 - the
  image field is a picker with thumbnails, pagination and inline upload)

## Design and accessibility

- [ ] Jubla: check final illustrations and long titles on small phones.
- [x] Uncle-T: use one form of address throughout the site. (resolved in the
  W3-B pass - Sie -> Du across site and catalog)
- [ ] Zelglihof: use real farm photos.
- [ ] Studio: simplify mobile lists. (Unsaved-edit protection landed as TD-09,
  resolved 2026-11.)
- [ ] Check keyboard use, focus, contrast and mobile menus. Verify German
  customer sites and Studio translations.

## Owner decisions

- [ ] Uncle-T: confirm inquiry fields, phone-only replies, statuses and reviews.
  Decide on a Google reviews embed.
- [ ] Zelglihof: confirm contact fields, products, quantity limits, pickup
  statuses and reservation windows. Agree display-only CHF price wording.
- [ ] Jubla: confirm annual dates, same-day event endings, calendar/PDF exports,
  group names and donation units with the second developer.
- [ ] Set up the two mail identities per domain that sends subscriber mail:
  `newsletter@` (sending identity) plus the requests inbox
  (`hof@`/`info@`/`scharleitung@`, recipient and Reply-To). Confirm the provider
  SMTP may send as both addresses, and confirm the `@zelglihof.ch` mailboxes the
  code defaults to actually exist (site domain is `zelglihof-maegenwil.ch`).
- [ ] Content review (2026-11), Jubla: confirm the club's founding year. The
  rewrite's hero eyebrow claim "seit 1981" had no source in legacy or jubla.ch
  and was removed until confirmed.
- [ ] Content review (2026-11), legal: approve restoring the paragraphs the
  rewrite dropped - Jubla Impressum (full Haftungsausschluss including the links
  disclaimer and the "Quelle: SwissAnwalt" credit), Uncle-T Disclaimer block,
  Uncle-T AGB clauses on cleaning and on insurance/permits. The published legacy
  wording is ready to restore on a go-ahead.
- [ ] Content review (2026-11), wording decisions: "Beitreten" vs "Mitmachen",
  the "Spende" → "Zusage" domain rebrand, the invented three-step join process
  (Melden/Schnuppern/Entscheiden), the dropped partner descriptions (31'000
  Mitglieder, 53 Scharen, group sizes) and the dropped delivery offer on
  Uncle-T ("nachhause oder in die Firma geliefert").
- [ ] Authentication and account model (O-006): local passwords vs. an external
  provider, bootstrap/invitations, recovery, revocation, MFA. Fewer than ten
  users; needs a decision and a short threat model. The proposed local model is
  in [decisions](../reference/decisions.md#still-open).
- [ ] Schema and migration ownership (O-010): schema-per-capability vs. a domain
  split, migration tool, locking and expand/contract conventions. The proposed
  Flyway/schema-per-capability direction is in
  [decisions](../reference/decisions.md#still-open).
- [ ] Collect the "detailed notes will follow" legacy site restructuring notes
  and fold them into [sites](../reference/sites.md) and the migration inventory.

## Later

- [ ] Translate the remaining hard-coded labels and content in Studio and the
  public sites.
- [ ] Check Paraglide URL translation, such as `/kontakt` and `/contact`. Use
  German customer URLs and English source filenames.
- [ ] Revisit queued newsletter cancellation and stale confirmation links as
  volume grows. Current priority is low.
- [ ] Add email verification and password recovery only if public accounts are
  introduced; Studio is excluded.
