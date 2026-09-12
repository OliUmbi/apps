# Open work

Only unresolved questions and unfinished work. Remove items when resolved.

## Technical

- [ ] Wire account_notification to the settings UI and recipient selection; require
  account access to the event's site. Notification opt-in must not grant permission.
- [ ] Agree username/email case handling, shared normalization and account email
  verification. Keep identity inaccessible to Studio's database role.
- [ ] Copy reservation/commitment snapshots from database rows in the write
  transaction. Define cancellation stock restoration when the variant was deleted;
  never silently restore stock to another variant.
- [ ] Implement atomic online allocation and duplicate-submit protection for
  reservations. Donation commitments remain simple manual administration.
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
- [ ] Define how referenced images are retained when content snapshots outlive the
  source record or asset visibility changes.
- [ ] Add focused integration checks for forms, identity, notifications, asset
  lifecycle, and messaging delivery. The Java reactor currently has no tests.
- [ ] Validate internationalization throughout the applications. Studio and the
  future Oliumbi site should support English and German; the three customer sites
  are German-only.
- [ ] Document intentional route changes from the legacy applications and provide
  redirects for URLs that must remain stable.
- [ ] Establish structured logging conventions and Java API integration tests.
- [ ] Add a Java static-analysis baseline for class size, complexity, and style.

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
