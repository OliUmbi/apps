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
| [TD-01](#td-01) | Edge: proxy rate limiting | P1 | decision-gated |
| [TD-02](#td-02) | Edge: Content-Security-Policy | P2 | open |
| [TD-03](#td-03) | Edge: static asset caching | P3 | open |
| [TD-04](#td-04) | Data: PostgreSQL major upgrade path | P2 | open |
| [TD-05](#td-05) | Assets: Windows junction containment | P2 | in progress |
| [TD-06](#td-06) | Studio/identity: profile field ownership | P1 | resolved |
| [TD-07](#td-07) | Studio: upload vs. save state | P2 | resolved |
| [TD-08](#td-08) | Studio: deletion and stock-restoration policy | P2 | decision-gated |
| [TD-09](#td-09) | Studio: dirty editor navigation | P2 | resolved |
| [TD-10](#td-10) | Studio: per-handler authorization convention | P3 | resolved |
| [TD-11](#td-11) | Data: queue privileges exceed the producer interface | P2 | resolved |
| [TD-12](#td-12) | Messaging: unbounded campaign batch | P3 | decision-gated |
| [TD-13](#td-13) | Services: integration tests and Java style check | P3 | open |
| [TD-14](#td-14) | Data: legacy import validation | P1 | open |
| [TD-15](#td-15) | Identity: plaintext unsubscribe tokens | P2 | decision-gated |
| [TD-16](#td-16) | Operations: Caddy state outside the backup | P2 | decision-gated |
| [TD-17](#td-17) | Operations: backup checksum manifest is not portable | P3 | open |

Open counts: 2 P1, 6 P2, 4 P3. The 2026-10 refactor resolved most findings in the
[code quality review](../history/code-quality-review.md); their dispositions
remain there as evidence and are not repeated here.

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
rehearsal and reconciliation is the open work.*

## P2 - next focused cleanup

### TD-02

**No Content-Security-Policy is sent.** The legacy nginx sent one that referenced
the retired `api.*` hosts; the new stack sends none. The other security headers
are present at Caddy.

- **Next action:** define one policy per site (or a shared baseline with per-site
  exceptions), test embeds and inline styles, then ship it with the caddy image.
- **Source:** old open-work technical debt.

### TD-04

**The PostgreSQL major-version upgrade path is undocumented.** Images stay pinned,
which is correct, but there is no tested procedure for moving 18 → 19 without
data loss.

- **Next action:** write and exercise a dump/restore or `pg_upgrade` procedure in
  a drill, including extensions, roles and media consistency.
- **Source:** old open-work technical debt.

### TD-05

**Assets path containment does not cover Windows junction symlinks.** A junction
can point outside the storage root on a Windows development host. Production is
Linux, so this is a development-host risk.

- **Next action:** decide whether to harden the containment check for Windows
  reparse points or accept the gap and document why. Owner decision.
- **Source:** old open-work technical debt.

*Disposition (2026-11): hardened in code - `StorageFiles.checkPath` rejects a
symbolic-link storage root and walks every ancestor rejecting symbolic links on
all path entry points; the JDK reports NTFS junctions as symlinks. Remaining:
verify once against a real Windows junction, then close.*

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
are still plaintext and are looked up by equality, so the token-contract
decision (including migration of existing links) remains open.*

### TD-16

**Caddy's ACME state is outside the nightly backup.** D12 says backed-up state
lives under `/var/lib/apps/` including caddy, but `backup.sh` archives only the
database and media. A rebuilt host must re-issue certificates, subject to Let's
Encrypt rate limits.

- **Next action:** either add `caddy-data`/`caddy-config` to the archive or record
  the deliberate decision that re-issuance is the recovery path, with a tested
  DNS/token procedure.
- **Source:** D12 vs. `ansible/files/backup.sh`.

## P3 - smaller or later

### TD-03

**Static asset caching is a one-hour default from Caddy.** Files in `public/` are
not content-hashed, so they cannot be cached immutably.

- **Next action:** content-hash public assets, then raise the cache lifetime for
  hashed paths. App-owned `/api/assets/*` headers already win.
- **Source:** old open-work technical debt.

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

### TD-12

**Campaign batching does not bound the transaction.** A campaign send reads
confirmed subscribers and queues each email individually, but the batch size is
not bounded by campaign size. A very large campaign holds a long transaction.

- **Next action:** set a campaign-size bound or page the send with a resumable
  cursor. Decision-gated on expected volume.
- **Source:** R19.

*Update (2026-11): recipients are now paged with a keyset cursor, but the whole
send still runs in one transaction and is not resumable; the bound/resumable
decision remains open.*

### TD-13

**Java integration tests and a style check are missing.** Unit tests cover the
services; there is no suite against a real PostgreSQL and no Java format check in
CI.

- **Next action:** add a PostgreSQL-gated integration suite for the service
  boundaries, then a formatter/check that matches the project style.
- **Source:** R33 partial; `services/README.md`.

### TD-17

**The backup checksum manifest is not portable.** `backup.sh` runs
`sha256sum "$WORK"/*`, so `SHA256SUMS` records absolute temporary paths from the
server. After extracting the archive elsewhere, `sha256sum -c SHA256SUMS` cannot
find the files; verification is manual and easy to skip.

- **Next action:** write relative names (`cd "$WORK" && sha256sum * > SHA256SUMS`)
  so the archive verifies with `sha256sum -c SHA256SUMS` after extraction.
- **Source:** `ansible/files/backup.sh`; restore procedure.

## Accepted limitations (not debt)

These are deliberate trade-offs, recorded so they are not re-litigated as
defects. Revisit only when the stated condition changes.

| Limitation | Why accepted |
| --- | --- |
| No staging environment or end-to-end suite | One maintainer, low traffic; the environment integration pass and restore drill cover the risk for now. |
| One host, no HA, autoscaling or multi-region | Traffic and budget do not justify it; recoverability is the chosen answer. |
| No host firewall | The router forwards and unit bind addresses are the boundary; a host firewall would not stop published ports. |
| No CDN; media on disk | Private server, small audience; the assets service owns cache headers. |
| Journald only, no Loki | One host and a 200 MB cap are enough until log volume or query needs grow. |
| Monitoring state is not backed up | Prometheus/Grafana history is disposable; application data is not. |
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
