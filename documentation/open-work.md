# Open work

Only unresolved questions and unfinished work. Remove items when resolved.

## Technical

- [ ] Port Java/web queries to the new schema, direct publication filters, showcase
  naming and shared queue. The application still targets the previous tables.
- [ ] Settle user permissions and enforce them in Studio; currently sign-in grants
  access to all screens. Candidate: one permission per site feature, without roles.
- [ ] Wire account_notification to the settings UI and recipient selection; require
  account access to the event's site. Notification opt-in must not grant permission.
- [ ] Agree username/email case handling, shared normalization and account email
  verification. Keep identity inaccessible to Studio's database role.
- [ ] Copy reservation/commitment snapshots from database rows in the write
  transaction. Define cancellation stock restoration when the variant was deleted;
  never silently restore stock to another variant.
- [ ] Implement atomic online allocation and duplicate-submit protection for
  reservations. Donation commitments remain simple manual administration.
- [ ] Implement one producer adapter and one email retry worker. Reuse the producer's
  UUID per logical delivery; decide whether mismatched reuse needs a content hash.
- [ ] Worker: use available_at for backoff, locked_at for stale work and monotonic
  attempt_count to reject old completions. Never reset attempt_count on retry.
  Decide retry delays/limit and handling of uncertain SMTP acceptance.
- [ ] Campaign: recipient-level progress, duplicate-send protection, failed-recipient
  review and cancellation of queued mail after unsubscribe. Never retry a whole
  campaign just because some recipients failed.
- [ ] Confirmation: fixed expiry from requested_at, issuance rate limit, token
  rotation on new requests, and suppression of obsolete queued links. Transport
  retries must reuse the same token. One stable opaque unsubscribe token per subscriber.
- [ ] Message sender allowlist per site, Reply-To and unsubscribe headers; producers
  compose text/HTML. Decide payload/key retention and deletion of recipient data.
- [ ] Shared queue/media access is deliberately broad: site isolation within them
  and all public visibility filtering must be handled by application code.
- [ ] Media: images/PDFs, file metadata, UUID directory depth, upload limits,
  derivatives and deletion/cache behavior. Snapshot image ids do not preserve files.
- [ ] Recheck existing lint/build failures; add focused integration checks while
  adapting forms, identity, notifications and the worker.
- [ ] review if identity account management need session validation so no user edits 
  another or even has the permission to create an account
- [ ] logging and testing for java apis
- [ ] linting for java projects (god classes, line length, etc.)
- [ ] Recheck if all projects (especially java) are still aligned with their dependencies.
- [ ] Review README's and shorten them so a dev can get a good overview at a quick glance (make heavy use of lists, tables and diagrams)

## Owner requirements

- [ ] Uncle-T: verify required/optional email, phone, date, location and guest count;
  choose email acknowledgement behavior for phone-only inquiries and final statuses.
- [ ] Zelglihof: verify required/optional contact fields on inquiries/reservations,
  actual products/variants, quantity limits and pickup/cancellation statuses.
- [ ] Zelglihof: confirm display-only CHF price wording (per kg/package/estimate)
  and reservation windows. Price text will not be used for totals or payment.
- [ ] Jubla: confirm annual dates, same-day ends_on, calendar import/printable PDF,
  group names and donation item units/steps with the second developer.
- [ ] Campaigns: decide whether definite temporary delivery failures retry
  automatically or every failure needs admin review; uncertain sends need review.
- [ ] Notifications: choose event names and who should initially opt in.
- [ ] Obtain final copy/photos/contact details and showcase/review content from
  owners. External Google reviews are an embed decision, not database imports.

## Before first live data

- [ ] Rotate development credentials and explicitly rebuild existing local roles/
  volumes when switching to short role names. Docker bootstrap runs only once.
- [ ] Freeze schema only when needed; review essential constraints/indexes then.
- [ ] Verify sender DNS/SMTP, unsubscribe flow, domain routing/TLS and recovery.
- [ ] Confirm database/media backups, retention and legacy data/URL migration.
- [ ] Finish the site editors and Oliumbi; hide incomplete features before launch.
