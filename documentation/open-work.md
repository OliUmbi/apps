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

## Features

- [ ] Prevent duplicate reservations and donation commitments after retries.
- [ ] Define reservation cancellation and stock restoration, including deleted variants.
- [ ] Connect notifications to users with site access. Choose event names and initial subscribers.
- [ ] Show campaign delivery results per recipient. Agree retry rules for failed and uncertain sends.
- [ ] Add allowed senders per site, Reply-To and unsubscribe headers. Set retention rules for messages, tokens and personal data.
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

## Later improvements

- [ ] Translate the remaining hard-coded labels and content in Studio and the public sites.
- [ ] Check Paraglide URL translation, such as `/kontakt` and `/contact`. Use German customer URLs and English source filenames.
- [ ] Revisit queued newsletter cancellation and stale confirmation links as volume grows. Current priority is low.
- [ ] Add email verification and password recovery only if public accounts are introduced; Studio is excluded.
- [ ] Add critical integration tests and Java style checks later. Java currently has no tests.
