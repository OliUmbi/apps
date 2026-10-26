# Open work

Only unresolved work. Remove items when resolved.

## Before launch

- [ ] Replace development secrets. Enable secure Studio cookies. Keep database and service ports private.
- [ ] Verify domains, TLS, public URLs, sender DNS and SMTP delivery.
- [ ] Set up database and media backups. Verify a restore.
- [ ] Check constraints, indexes and legacy imports before live data. Update roles and credentials on existing volumes. (Constraints and session indexes code complete in the 2026-10 refactor — CHECK constraints in V001–V010; verify in staging. Legacy-import validation is still open: inquiry subjects must map to 'other', and zero-quantity legacy rows are rejected by the new constraints.)
- [ ] Add rate limits for login, inquiries, reviews and newsletter requests. (App-level honeypots on all six public forms landed in the 2026-10 refactor; the proxy rate-limit decision is still open — see Technical debt.)
- [ ] Check site permissions and unpublished content with real roles. Verify application checks on shared media and queues.
- [ ] Add health checks, alerts and useful logs.
- [x] Run lint, type checks and builds in CI. (done 2026-10: `.github/workflows/ci.yml` runs the web checks and the Java suites via `services/mvnw`, and gates `publish.yml`.)
- [ ] Approve final content, photos and legal pages. Add old URL redirects, page metadata and content sitemaps.
- [ ] Check publishing, forms, reservations, login and email in staging. Test service outages. Hide unfinished features; Oliumbi is still missing.

## Infrastructure and operations

Deployment shape: ghcr images pinned by tag, `infrastructure/compose.prod.yaml`,
caddy with DNS-01 wildcards (Infomaniak), manual deploys over WireGuard. Context:
[architecture](architecture.md), [infrastructure/README.md](../infrastructure/README.md).

- [ ] Cutover from `legacy/`: freeze writes, final `pg_dump` (postgres 17), restore into postgres 18, flip DNS. Decide whether the new migrations continue the legacy history or start fresh and map the data. Delete the retired `api.*` DNS records.
- [ ] Rotate the legacy database and email passwords: `legacy/infrastructure/.env` is committed to git. Never reuse those values.
- [ ] Check whether 5432/8080/8000 on the current server are reachable from the internet (legacy exposure). The new stack has no host firewall by design -- the router forwards are the boundary, so verify only 80/443 and UDP 51820 (WireGuard) are forwarded, nothing else.
- [ ] Bootstrap the server with `ansible/playbooks/site.yml` (deploy user, vault, wireguard), then verify the status / logs / backup playbooks from the workstation. A restore playbook is still missing.
- [ ] Backups are scripted (`ansible/files/backup.sh`, nightly timer): enable on the server, confirm the workstation pull (`pull-backups.sh`), then run the first restore drill per [operations.md](operations.md).
- [ ] Housekeeping timer is scripted (`ansible/files/housekeep.sh`): enable on the server and check the first journal output.
- [ ] WireGuard config is templated (server role). Verify provider console/KVM recovery first, then set `restrict_ssh: true` so sshd only listens on the tunnel.
- [ ] Create the A records listed in `dyndns_records` (`ansible/group_vars/all.yml`) once in the Infomaniak manager, including `vpn.oliumbi.ch` for the laptop's WireGuard endpoint. The dyndns timer only updates existing records.
- [ ] Decide where the oliumbi.ch apex routes: the new stack has no Oliumbi site yet (Caddyfile placeholder redirects to studio).
- [ ] Create the ntfy alerting topic, subscribe in the phone app and store the webhook URL in the vault (`vault_ntfy_webhook_url`); setup steps in [operations.md](operations.md).
- [ ] Deploy the monitoring stack (`infrastructure/compose.monitoring.yaml`) and confirm alerts reach the phone (test with a manual `curl` to the topic). Then add external uptime checks and a dead-man's switch outside the box -- everything current runs on the machine it watches.
- [ ] Add `MESSAGING_SMTP_TLS_REQUIRED` to the `infrastructure/.env.dev` and `.env.prod` templates. Compose passes the variable since the 2026-10 refactor, but the templates still carry only `MESSAGING_SMTP_TLS`, so deploy-time values fall back to the compose defaults.

## Open decisions

- [ ] Authentication and account model (O-006 in [decisions.md](decisions.md)): local passwords vs. external provider, bootstrap/invitations, recovery, revocation, MFA. Fewer than ten users; needs a decision and a short threat model.
- [ ] Schema and migration ownership (O-010): schema-per-capability vs. domain split, migration tool, locking and expand/contract conventions. Proposals wanted.
- [ ] Collect the "detailed notes will follow" legacy site restructuring notes and fold them into [sites.md](sites.md) and the migration inventory.

## Features

- [ ] Prevent duplicate reservations and donation commitments after retries. (code complete in the 2026-10 refactor: client-generated submission ids checked in-transaction through unique indexes (V011), references stable on replay; verify in staging)
- [ ] Define reservation cancellation and stock restoration, including deleted variants.
- [ ] Connect notifications to users with site access. Choose event names and initial subscribers.
- [ ] Show campaign delivery results per recipient. Agree retry rules for failed and uncertain sends.
- [ ] Add allowed senders per site and List-Unsubscribe headers (the `replyTo` contract field and the `*_REQUESTS_EMAIL` / `*_NEWSLETTER_EMAIL` split are implemented). Set retention rules for messages, tokens and personal data.
- [ ] Clarify image publication and retention when linked content outlives an image.
- [ ] Improve image selection and previews in Studio.

## Design

- [ ] Jubla: check final illustrations and long titles on small phones.
- [ ] Uncle-T: use one form of address throughout the site.
- [ ] Zelglihof: use real farm photos.
- [ ] Studio: simplify mobile lists and shorten overview cards. Protect unsaved edits.
- [ ] Check keyboard use, focus, contrast and mobile menus. Verify German customer sites and Studio translations.

## Owner decisions

- [ ] Uncle-T: confirm inquiry fields, phone-only replies, statuses and reviews. Decide on a Google reviews embed.
- [ ] Zelglihof: confirm contact fields, products, quantity limits, pickup statuses and reservation windows. Agree display-only CHF price wording.
- [ ] Jubla: confirm annual dates, same-day event endings, calendar/PDF exports, group names and donation units with the second developer.
- [ ] Set up the two mail identities per domain that sends subscriber mail: `newsletter@` (sending identity) plus the requests inbox (`hof@`/`info@`/`scharleitung@`, recipient and Reply-To). Confirm the provider SMTP may send as both addresses, and confirm the `@zelglihof.ch` mailboxes the code defaults to actually exist (site domain is `zelglihof-maegenwil.ch`).

## Technical debt

- [ ] Rate limiting at the proxy: standard Caddy has none (legacy nginx: 10r/s, burst 20). Either build `caddy-ratelimit` into apps-caddy or accept the gap deliberately.
- [ ] Content-Security-Policy: the legacy nginx sent one referencing `api.*`; the new stack sends none. Define one per site.
- [ ] Service health: `/actuator/health` exists but the runtime image has no curl, so compose falls back to TCP checks. Add curl to the images or keep TCP deliberately.
- [ ] Static asset caching is a one-hour default from caddy; revisit once `public/` files are content hashed.
- [ ] Keep compose on pinned tags (`:latest` is published but unused) and document the postgres major upgrade path (dump/restore).
- [ ] Pin the monitoring image versions (`:latest` placeholders in `compose.monitoring.yaml`) on first deploy.
- [ ] Port the remaining legacy ideas worth keeping: web app manifest and icons, dark mode / color scheme, site analytics, UI linter.
- [ ] `services/assets` path defenses do not contain Windows junction symlinks (a junction can point outside the storage root on Windows dev hosts). Decide whether to harden the containment check or accept the gap (owner decision).

## Later improvements

- [ ] Translate the remaining hard-coded labels and content in Studio and the public sites.
- [ ] Check Paraglide URL translation, such as `/kontakt` and `/contact`. Use German customer URLs and English source filenames.
- [ ] Revisit queued newsletter cancellation and stale confirmation links as volume grows. Current priority is low.
- [ ] Add email verification and password recovery only if public accounts are introduced; Studio is excluded.
- [ ] Java unit tests exist for all services (`services/mvnw test`, 168 tests). Follow-ups: integration tests against a real PostgreSQL (see the assessment in the test report) and Java style checks.

## Proposal: tracker consolidation (RS-F5 — owner decides)

Raised as RS-F5 in the services review and prepared by the 2026-10 docs sync.
Not adopted: the owner decides. Until then, nothing changes.

- [ ] Freeze [code-quality-review.md](code-quality-review.md) as a historical
  document (its findings carry 2026-10 dispositions) and move the still-live
  items into this file, keeping their R-numbers, so every finding is tracked
  exactly once. The frozen document keeps the full finding descriptions; this
  file carries only the open work.
