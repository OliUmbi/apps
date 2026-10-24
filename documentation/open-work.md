# Open work

Only unresolved work. Remove items when resolved.

## Before launch

- [ ] Replace development secrets. Enable secure Studio cookies. Keep database and service ports private.
- [ ] Verify domains, TLS, public URLs, sender DNS and SMTP delivery.
- [ ] Set up database and media backups. Verify a restore.
- [ ] Check constraints, indexes and legacy imports before live data. Update roles and credentials on existing volumes.
- [ ] Add rate limits for login, inquiries, reviews and newsletter requests.
- [ ] Check site permissions and unpublished content with real roles. Verify application checks on shared media and queues.
- [ ] Add health checks, alerts and useful logs. Run lint, type checks and builds in CI.
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

## Open decisions

- [ ] Authentication and account model (O-006 in [decisions.md](decisions.md)): local passwords vs. external provider, bootstrap/invitations, recovery, revocation, MFA. Fewer than ten users; needs a decision and a short threat model.
- [ ] Schema and migration ownership (O-010): schema-per-capability vs. domain split, migration tool, locking and expand/contract conventions. Proposals wanted.
- [ ] Collect the "detailed notes will follow" legacy site restructuring notes and fold them into [sites.md](sites.md) and the migration inventory.

## Features

- [ ] Prevent duplicate reservations and donation commitments after retries.
- [ ] Define reservation cancellation and stock restoration, including deleted variants.
- [ ] Connect notifications to users with site access. Choose event names and initial subscribers.
- [ ] Show campaign delivery results per recipient. Agree retry rules for failed and uncertain sends.
- [ ] Add allowed senders per site, Reply-To and unsubscribe headers. Add an optional `replyTo` to the message contract; split `*_OWNER_EMAIL` into `*_REQUESTS_EMAIL` (recipient/Reply-To) and `*_NEWSLETTER_EMAIL` (sender). Set retention rules for messages, tokens and personal data.
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

## Later improvements

- [ ] Translate the remaining hard-coded labels and content in Studio and the public sites.
- [ ] Check Paraglide URL translation, such as `/kontakt` and `/contact`. Use German customer URLs and English source filenames.
- [ ] Revisit queued newsletter cancellation and stale confirmation links as volume grows. Current priority is low.
- [ ] Add email verification and password recovery only if public accounts are introduced; Studio is excluded.
- [ ] Add critical integration tests and Java style checks later. Java currently has no tests.
