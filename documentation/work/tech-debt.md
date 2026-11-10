# Technical debt

Known structural debt with an owner-visible consequence and a next action. This
is the single home for debt: do not also list it in
[open work](open-work.md). Actionable product and operations tasks stay there;
decisions stay in [decisions](../reference/decisions.md).

## Severity and status

| Severity | Meaning |
| --- | --- |
| **P1** | Fix before relying on the affected workflow or before public launch. |
| **P2** | Fix in the next focused cleanup; a correctness, security or maintainability gap with a workaround. |
| **P3** | Smaller cleanup or a limitation to revisit when the area grows. |

Status is one of **open**, **decision-gated**, **in progress**, **accepted**
(deliberate, with the reason recorded) or **resolved**. Accepted debt is still
debt: it is listed so it is not rediscovered as a surprise.

## Overview

| ID | Area | Severity | Status |
| --- | --- | --- | --- |
| [TD-01](#td-01) | Edge: proxy rate limiting | P1 | resolved |
| [TD-02](#td-02) | Edge: Content-Security-Policy | P2 | resolved |
| [TD-03](#td-03) | Edge: static asset caching | P3 | resolved |
| [TD-04](#td-04) | Data: PostgreSQL major upgrade path | P2 | resolved |
| [TD-05](#td-05) | Assets: Windows junction containment | P2 | resolved |
| [TD-06](#td-06) | Studio/identity: profile field ownership | P1 | resolved |
| [TD-07](#td-07) | Studio: upload vs. save state | P2 | resolved |
| [TD-08](#td-08) | Studio: deletion and stock-restoration policy | P2 | resolved |
| [TD-09](#td-09) | Studio: dirty editor navigation | P2 | resolved |
| [TD-10](#td-10) | Studio: per-handler authorization convention | P3 | resolved |
| [TD-11](#td-11) | Data: queue privileges exceed the producer interface | P2 | resolved |
| [TD-12](#td-12) | Messaging: unbounded campaign batch | P3 | resolved |
| [TD-13](#td-13) | Services: integration tests and Java style check | P3 | accepted |
| [TD-14](#td-14) | Data: legacy import validation | P1 | open |
| [TD-15](#td-15) | Identity: plaintext unsubscribe tokens | P2 | accepted |
| [TD-16](#td-16) | Operations: Caddy state outside the backup | P2 | accepted |
| [TD-17](#td-17) | Operations: backup checksum manifest is not portable | P3 | resolved |
| [TD-18](#td-18) | Services: bearer check runs after request binding | P3 | open |
| [TD-22](#td-22) | Operations: retention runs in the housekeeping shell script | P3 | accepted |

Open counts: 1 P1, 0 P2, 1 P3. Accepted: TD-13 (P3), TD-15 (P2), TD-16 (P2) and
TD-22 (P3); accepted debt stays listed. Every other entry is resolved. The 2026-10 refactor
resolved most findings in the [code quality review](../history/code-quality-review.md);
their dispositions remain there as evidence and are not repeated here.

## P1 - before relying or launching

### TD-01

**Proxy rate limiting is absent.** Standard Caddy has no rate limiter; the legacy
nginx allowed 10 r/s with a burst of 20. Public forms have application honeypots
and idempotency, and login has no proxy guard. Abuse or credential stuffing is
currently limited only by application behavior.

- **Next action:** decide between building `caddy-ratelimit` into the caddy image
  and accepting the gap explicitly. If accepted, write the reason and the
  compensating controls in this entry.
- **Source:** old open-work technical debt.

*Disposition (2026-11): fixed (TD-01) - the caddy image pins `caddy-ratelimit`
  (`5625512`, because the v0.1.0 tag predates Caddy 2.10). The public zone allows
  20 events per 2s per client IP (about 10 r/s sustained with a burst of 20) and
  groups IPv6 clients by /64; login is limited to 10 per minute. Both zones run
  before the application handlers, so the application honeypot is no longer the
  only brake.*

### TD-06

**Profile editing can undo an administrative account change.** Studio's profile
update reads `enabled` and sends it through the general account update; an
administrator disabling the account between the read and write can be undone.

- **Next action:** give profile changes an operation that updates only name and
  email. Keep administrative fields in identity's administrative operation.
- **Source:** R01.

*Disposition (2026-11): fixed (TD-06) - identity gained a dedicated
`PUT /account/{id}/profile` operation that updates only name and email; the
profile path reads with a row lock and can no longer carry `enabled`, with a
regression test in `AccountServiceTest`.*

### TD-14

**The owner-led manual legacy import is not yet validated or reconciled.** The
owner will migrate the small data set by hand (D16); no importer will be built.
Constraints are in place, but imported inquiries need a subject (map
uncategorized contacts to `other`), and zero-quantity donation/reservation rows
are rejected. An unchecked manual copy can fail mid-run or silently drop rows.

- **Next action:** rehearse the manual checklist with a sanitized extract, map
  every unknown status and subject, never send historical notifications, and
  reconcile source/migrated/skipped/failed counts plus media hashes before live
  data exists. Execute through [G0-E](go-live-remediation-plan.md#g0-e--reconcile-the-owner-led-manual-migration).
- **Source:** R07 remainder; [database/README.md](../../database/README.md).

*Update (2026-11): the manual checklist is complete
([manual-migration-checklist](manual-migration-checklist.md)); executing the
rehearsal and reconciliation is the open work. This is the only open P1.*

## P2 - next focused cleanup

### TD-02

**No Content-Security-Policy is sent.** The legacy nginx sent one that referenced
the retired `api.*` hosts; the new stack sends none. The other security headers
are present at Caddy.

- **Next action:** define one policy per site (or a shared baseline with per-site
  exceptions), test embeds and inline styles, then ship it with the caddy image.
- **Source:** old open-work technical debt.

*Disposition (2026-11): fixed (TD-02) - a baseline CSP ships with the shared site
  headers in the Caddyfile: self-only defaults, `frame-ancestors 'none'`,
  `form-action 'self'`, image/font/connect/worker restrictions and
  `upgrade-insecure-requests`. Scripts and styles still allow inline code, so
  this is a baseline policy rather than a nonce-based strict policy; revisit if
  an embed needs more than the current policy allows.*

### TD-04

**The PostgreSQL major-version upgrade path is undocumented.** Images stay pinned,
which is correct, but there is no tested procedure for moving 18 → 19 without
data loss.

- **Next action:** write and exercise a dump/restore or `pg_upgrade` procedure in
  a drill, including extensions, roles and media consistency.
- **Source:** old open-work technical debt.

*Disposition (2026-11): fixed (TD-04) - the dump/restore major-version procedure
  is documented in [backup and restore](../operations/backup-restore.md#postgresql-major-version-upgrade):
  stop the app units, `pg_dumpall --globals-only` plus `pg_dump -Fc`, move to the
  new data directory and major, restore, reconcile role passwords from the
  vault, run the migrate unit, verify and re-enable backups. It has not been
  exercised on a real major upgrade; the restore drill is the next evidence.*

### TD-05

**Assets path containment does not cover Windows junction symlinks.** A junction
can point outside the storage root on a Windows development host. Production is
Linux, so this is a development-host risk.

- **Next action:** decide whether to harden the containment check for Windows
  reparse points or accept the gap and document why. Owner decision.
- **Source:** old open-work technical debt.

*Disposition (2026-11): fixed (TD-05) - `StorageFiles.checkPath` rejects a
  symbolic-link storage root and walks every ancestor rejecting links/reparse
  points on all path entry points. The Windows junction tests now pass where the
  host can create a junction (`mklink /J`), and the filesystem walk leaves an
  outside target untouched when a junction is inside the directory being
  removed.*

### TD-07

**Image uploads do not participate in the editor save state.** An editor can
start replacing an image and save the previous image before the upload finishes;
a late result may change local state or be discarded when the form remounts.

- **Next action:** expose upload readiness to the editor and block saving an
  incomplete image selection.
- **Source:** R03.

*Disposition (2026-11): fixed (TD-07) - the editor tracks upload readiness,
disables saving while an upload runs, and surfaces the wait in the i18n
catalog; a new value enters form state only on upload success.*

### TD-08

**Record deletion hides business lifecycle decisions.** Deleting a product,
variant or campaign record does not state what happens to reservations, stock or
history. Cancellation and stock restoration (including deleted variants) are not
defined.

- **Next action:** decide the lifecycle policy first, then implement deletion and
  cancellation as explicit state transitions with an audit trail.
- **Source:** R09.

*Disposition (2026-11): fixed (TD-08) - products and variants are retired by
  archiving (`archived_at`/`archived_by`) and never hard-deleted, so stock rows
  and reservation snapshots survive. Reservations are never hard-deleted and are
  cancelled only through an explicit one-time transition from `new`/`in-progress`
  that locks the reservation and variant, restores tracked stock once, and
  records `cancelled_at`/`cancelled_by`/`cancellation_reason`/`stock_restored`.
  Queued campaigns are irreversible; only drafts are deletable, because queued
  mail has no cancellation contract. Covered by
  `web/tests/zelglihof-lifecycle.test.ts` and the PostgreSQL-gated repository
  suites.*

### TD-09

**Dirty editor state does not reach navigation.** Leaving an edited record does
not warn or block, so unsaved changes can be lost.

- **Next action:** surface dirty state from the editor and intercept in-app and
  browser navigation.
- **Source:** R11.

*Disposition (2026-11): fixed (TD-09) - `useBlocker` intercepts in-app
navigation and registers `beforeunload` for the browser, a discard dialog
covers cancel/close, and a successful save remounts the editor. Known residual:
a related collection's own panel navigation still bypasses the warning; the
form's cancel button and router navigation are covered.*

### TD-11

**Queue roles have broader privileges than the producer interface needs.**
Producers can select and insert on `queue`; the contract only needs insert (and
their own replay handling). This is a least-privilege gap, not an exploit.

- **Next action:** narrow the grants per producer role and confirm replay/idempotency
  still works without broad read access. Owner/design decision.
- **Source:** R17.

*Disposition (2026-11): fixed (TD-11) - producer roles receive INSERT-only
default privileges on `queue`; enqueue no longer reads the table, and
idempotency is owned by the per-domain `submission_id` unique indexes with the
queue's unique id as a fail-closed backstop.*

### TD-15

**Unsubscribe tokens are stored plaintext.** Hashing is a contract change with
the Zelglihof data package and was deferred in the 2026-10 pass.

- **Next action:** decide the token contract (lookup strategy, migration of
  existing links, expiry) and hash at rest.
- **Source:** D10; old open-work technical debt.

*Update (2026-11): confirmation tokens are hashed at rest; unsubscribe tokens
are still plaintext and are looked up by equality.*

*Disposition (2026-11): accepted (TD-15) - unsubscribe tokens stay plaintext for
  launch (D20). The value is a random per-subscriber token, and it is also copied
  into queued message bodies, so hashing the column alone would not remove the
  exposure. The risk is low-severity integrity: a leaked queue/body copy could
  unsubscribe one address; it grants no read access and exposes no personal data
  beyond the subscriber address. Controls: HTTPS-only delivery, hashed
  confirmation tokens, seven-day sessions, an idempotent single-purpose endpoint
  and fewer than ten accounts. Revisit when newsletter volume or public accounts
  grow.*

### TD-16

**Caddy's ACME state is outside the nightly backup.** D12 says backed-up state
lives under `/var/lib/apps/` including caddy, but `backup.sh` archives only the
database and media. A rebuilt host must re-issue certificates, subject to Let's
Encrypt rate limits.

- **Next action:** either add `caddy-data`/`caddy-config` to the archive or record
  the deliberate decision that re-issuance is the recovery path, with a tested
  DNS/token procedure.
- **Source:** D12 vs. `ansible/files/backup.sh`.

*Disposition (2026-11): accepted (TD-16) - ACME state is deliberately excluded
  (D21). A rebuilt host re-issues through DNS-01 with
  `vault_infomaniak_api_token` and `vault_acme_email`; the Caddyfile is baked
  into the image, `CertificateExpiringSoon` warns 14 days ahead, and the
  re-issuance step is part of the restore drill. The accepted consequence is
  dependence on the vault token and Let's Encrypt rate limits during recovery;
  the procedure is in [backup and restore](../operations/backup-restore.md#caddy-acme-state-and-re-issuance).*

## P3 - smaller or later

### TD-03

**Static asset caching is a one-hour default from Caddy.** Files in `public/` are
not content-hashed, so they cannot be cached immutably.

- **Next action:** content-hash public assets, then raise the cache lifetime for
  hashed paths. App-owned `/api/assets/*` headers already win.
- **Source:** old open-work technical debt.

*Disposition (2026-11): fixed (TD-03) - Vite build assets with a content hash
  under `/assets/` are `public, max-age=31536000, immutable`; unhashed public
  files (PDFs, logos, fonts) keep the one-hour default. Uploaded images under
  `/api/assets/*` keep their own cache headers.*

### TD-10

**Authorization is a per-handler convention.** Each Studio server function calls
`requireActor`, but the type system does not require it. A new handler can forget
the check.

- **Next action:** wrap handler creation in a capability-typed helper so an
  unguarded handler does not type-check.
- **Source:** R16.

*Disposition (2026-11): resolved with an accepted deviation - every Studio
server function declares the `studioAuthorization`/`authenticatedAuthorization`
middleware, and the only unguarded functions are the public session endpoints.
The type-level guard was deliberately not built: TanStack's import protection
requires `createServerFn` visible at each endpoint. The residual risk (a new
handler can forget the middleware) is accepted and recorded here.*

*Update (2026-11, test review): the residual risk is now guarded by a
structural test (`web/tests/studio-wiring.test.ts`): every `createServerFn` in
`web/sites/studio/src/server/**/*.functions.ts` must declare one of the two
authorization middleware entries, and the public session file is the only
allowlisted exception. Removing the middleware from any handler fails the
suite.*

### TD-12

**Campaign batching does not bound the transaction.** A campaign send reads
confirmed subscribers and queues each email individually, but the batch size is
not bounded by campaign size. A very large campaign holds a long transaction.

- **Next action:** set a campaign-size bound or page the send with a resumable
  cursor. Decision-gated on expected volume.
- **Source:** R19.

*Disposition (2026-11): fixed (TD-12) - a campaign is bounded at 500 active
  recipients (`campaignRecipientLimit`). The count runs inside the campaign
  transaction before anything is queued; an over-limit run returns the typed
  `too-large` outcome and leaves the draft unchanged. Recipients are still paged
  with a keyset cursor inside that bound.*

### TD-13

**Java integration tests and a style check are missing.** Unit tests cover the
services; there is no suite against a real PostgreSQL and no Java format check in
CI.

- **Next action:** add a PostgreSQL-gated integration suite for the service
  boundaries, then a formatter/check that matches the project style.
- **Source:** R33 partial; `services/README.md`.

*Disposition (2026-11): partially resolved / accepted (TD-13) - Checkstyle now
  runs in `mvn test` (configuration in `services/checkstyle.xml`, main and test
  sources, errors fail the build), so the style gate is closed. A real-PostgreSQL
  Java integration suite is accepted post-launch debt: service boundaries are
  covered by unit tests, the data layer has PostgreSQL-gated web suites, and a
  second Java database fixture would duplicate the migration setup for little
  launch value at this volume. Revisit when a service boundary changes or an
  integration regression appears.*

*Update (2026-11, test review): the highest-value slice is now covered. Each
service has a narrow `@DataJpaTest` persistence suite against the same migrated
database (CI provisions it): `ddl-auto=validate` catches entity/schema drift,
and the tests pin the native queue/delivery/permission queries, the lifecycle
CHECK constraints and one `SKIP LOCKED` claim. Broader end-to-end service
integration (HTTP plus JPA) remains accepted debt.*

### TD-17

**The backup checksum manifest is not portable.** `backup.sh` runs
`sha256sum "$WORK"/*`, so `SHA256SUMS` records absolute temporary paths from the
server. After extracting the archive elsewhere, `sha256sum -c SHA256SUMS` cannot
find the files; verification is manual and easy to skip.

- **Next action:** write relative names (`cd "$WORK" && sha256sum * > SHA256SUMS`)
  so the archive verifies with `sha256sum -c SHA256SUMS` after extraction.
- **Source:** `ansible/files/backup.sh`; restore procedure.

*Disposition (2026-11): fixed (TD-17) - the manifest is written from the work
  directory with relative names, so `sha256sum -c SHA256SUMS` verifies the
  extracted archive on another machine.*

### TD-18

**Bearer checks run after Spring binds request arguments.** In the assets
controllers (and `PermissionController`), `@RequestPart`/`@RequestBody`
resolution happens before `authorization.requireValid(...)`, so an
unauthenticated request with a malformed body receives `400` instead of `401`.
No data is exposed; the only leak is that the endpoint exists. The tests send
well-formed bodies so they exercise the intended authorization path.

- **Next action:** move the bearer check into a filter or interceptor (or
  method-security annotation) that runs before argument resolution, then drop
  the well-formed-body workaround from the controller tests.
- **Source:** 2026-11 test review (Java mutation testing).

### TD-22

**Retention runs inside the host housekeeping shell script.** The weekly
`housekeep.sh` deletes expired delivery history, inbox rows and audit events
with `psql` through `podman exec`. It is fine for a handful of time windows on
one host, but it is not the place to grow a retention policy: per-table
anonymization, an export path or a second environment would turn the script
into a second data-access layer.

- **Next action:** revisit after launch. If the policy grows beyond simple age
  deletes, move retention into a scheduled job owned by the service that owns
  the data, with the same single success metric and alert.
- **Source:** PH-5; owner decision 2026-11 (interim shell job accepted).

*Disposition (2026-11): accepted (TD-22) - the current deletes are bounded,
fail closed (metric written last) and covered by `HousekeepStale`. The trigger
to revisit is a second retention rule that needs per-row logic or another
environment.*

## Accepted limitations (not debt)

These are deliberate trade-offs, recorded so they are not re-litigated as
defects. Revisit only when the stated condition changes.

| Limitation | Why accepted |
| --- | --- |
| No staging environment or end-to-end suite | One maintainer, low traffic; the environment integration pass and restore drill cover the risk for now. |
| No code coverage measurement | Unit, persistence-gated and web suites with a no-silent-skip CI guard cover the risk; a coverage percentage adds little signal at this scale (C-010). |
| One host, no HA, autoscaling or multi-region | Traffic and budget do not justify it; recoverability is the chosen answer. |
| No host firewall | The router forwards and unit bind addresses are the boundary; a host firewall would not stop published ports. |
| No CDN; media on disk | Private server, small audience; the assets service owns cache headers. |
| Journald only, no Loki | One host and a 200 MB cap are enough until log volume or query needs grow. |
| Monitoring state is not backed up | Prometheus/Grafana history is disposable; application data is not. Dashboards are restored by hand. |
| Dev compose is not a production mirror | The server runs podman/Quadlet; mirroring it would add a second topology to maintain. |
| No payments on Zelglihof | The product is a preorder intent, not a shop; adding payments is a new decision. |
| No universal CMS, page builder or tenant model | Sites are custom and independent; shared code moves only after a second consumer. |
| No custom framework or microservices by default | Ecosystem libraries and logical boundaries first; split only for a concrete runtime or security need. |

## Retiring an item

1. Fix it, or record the owner's explicit acceptance with a reason.
2. Annotate the source finding in place (for example
   `*Disposition (2026-11): fixed (TD-01) - ...*`).
3. Remove the entry from the overview and details, or mark it **resolved** with
   the date and the change. Do not leave a stale "open" row.
4. If the fix creates follow-up work, add it to [open work](open-work.md).
