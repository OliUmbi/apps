# Owner-led manual migration checklist

Use for the small legacy data set approved in D16. The owner performs the
migration by hand; no importer will be built. This checklist contains no personal
content. Keep source extracts, mapping notes and production values outside git.

## Prepare once

- [ ] Legacy is still authoritative and a restore-readable legacy backup exists.
- [ ] A sanitized extract and media manifest are available for rehearsal.
- [ ] Every legacy route, table, account, file, form and integration is marked
      **migrate / replace / archive / drop** with owner approval.
- [ ] Real email is disabled for rehearsal. Historical records will not create
      queue rows or notifications.
- [ ] The replacement schema is at the accepted pinned migration baseline (V012
      before the first accepted import).

## Map before copying

- [ ] Preserve each source ID in a private mapping note, even when the target ID
      differs. Do not put that note or personal values in this repository.
- [ ] Map every legacy status explicitly. Record unknown values as failures, not
      guesses.
- [ ] Map uncategorized Zelglihof contacts to subject `other`; use only documented
      subjects for other inquiries.
- [ ] Donation items/commitments and reservation rows have positive quantities
      and steps. Quarantine zero/invalid values for an owner decision instead of
      dropping or silently rounding them.
- [ ] Stock snapshots and current stock are reconciled deliberately; a copied
      reservation must not decrement stock a second time.
- [ ] Drafts, future dates, deleted states, long content and Unicode are included
      in the review, not only the visible happy-path records.
- [ ] Subscriber consent is verified. Historical imports do not trigger
      confirmation, welcome, campaign or owner email.

## Rehearse into a clean target

- [ ] Migrate Uncle-T first (O-002), then Jublawoma and Zelglihof.
- [ ] Prefer Studio for ordinary records. Use reviewed, parameterized SQL only
      where it saves real manual effort and never as an unlogged production edit.
- [ ] Copy media deliberately; generate derivatives through the owning assets
      workflow rather than editing its tables/files independently.
- [ ] Verify roles and site permissions with real accounts after the records
      exist.
- [ ] Complete the reconciliation tables below and correct every unexplained
      difference before continuing.
- [ ] Create and pull a backup of the rehearsal data, then complete the G0-C
      from-zero restore drill on the not-yet-live replacement host.

## Reconcile each site

Use one table per site. `source = migrated + skipped + failed` must hold for
every row. Skips need a reason and owner approval; failures must be zero before
final acceptance.

| Record/media type | Source | Migrated | Skipped (approved) | Failed | Notes/report reference |
| --- | ---: | ---: | ---: | ---: | --- |
| Pages/content records | | | | | |
| Events/articles/showcases/products | | | | | |
| Inquiries/reservations/donations | | | | | |
| Subscribers/campaigns | | | | | |
| Accounts/permissions | | | | | |
| Images/documents | | | | | |
| **Total** | | | | | |

| Check | Rehearsal result | Final result | Evidence |
| --- | --- | --- | --- |
| Every status/subject mapped; no unknowns | | | |
| No invalid/zero quantity silently accepted | | | |
| Source IDs/mapping notes complete | | | |
| Media count/sample/hashes accepted | | | |
| Long text and Unicode samples match | | | |
| Draft/future/deleted states match | | | |
| No historical notifications queued | | | |
| Routes and legacy redirects checked | | | |
| Real-role Studio/site checks pass | | | |
| Backup and restore verification pass | | | |

## Final cutover

- [ ] Freeze legacy writes and record the freeze time.
- [ ] Take the final PostgreSQL 17 export and media manifest with checksums.
- [ ] Repeat this checklist into PostgreSQL 18; do not improvise a different
      mapping during the cutover window.
- [ ] Complete both reconciliation tables with zero unexplained failures.
- [ ] Run internal smoke tests before switching router forwarding/DNS. Keep
      dyndns disabled before cutover; enable it only in the cutover run
      (`-e dyndns_enabled=true`).
- [ ] Record the first durable public write as the point of no return. Before it,
      routing may return to legacy; after it, export/replay the new writes or
      roll forward. A DNS-only rollback is not data-safe.
- [ ] Take and pull a fresh replacement backup immediately after cutover.
- [ ] Keep legacy protected through the observation window; apply RV-04 before
      any rollback that could strand new writes. Record the owner's sign-off and
      the observation window.
- [ ] After acceptance, retain final encrypted archives and record the retention
      dates before decommissioning legacy.

## Sign-off

| Run | Date (UTC) | Source snapshot | Target migration/image | Counts accepted | Media accepted | Restore accepted | Owner initials |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Rehearsal | | | | | | | |
| Final cutover | | | | | | | |
