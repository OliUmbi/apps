# Refactoring handoff — database & Java services

> Agent-to-agent handoff document. Source: code review session over `../database`,
> `services/` (identity, messaging, assets, shared) and the maintained
> documentation, cross-checked against `web/packages/*` schemas. All findings
> below were verified against the actual source before listing. No code has been
> changed yet.

## 0. How to use this document

An orchestrator will merge this report with sibling reports (overlaps are
expected) and dispatch subagents to perform the refactor.

- **Task IDs** (`RS-*`) are stable; dedupe against other reports by ID, then by
  `file:line`, then by problem statement. Severity may differ across reports —
  take the higher one.
- **Work packages** (A–F) are scoped so their file ownership does not overlap.
  Tasks *within* one package may be run in parallel only when their `Files:`
  lines are disjoint. Where two packages touch the same file, the task lists the
  exact block and the packages must be serialized.
- Each task states: severity, files, problem, change, acceptance criteria,
  conflicts, cross-boundary impact. Do not "improve beyond" the stated change;
  large rewrites are explicitly out of scope (see Ground rules).
- Section 6 lists decisions that must **not** be made by an executing agent.
  Section 7 lists questions worth exploring before or during the work.
- Appendix A maps findings onto existing trackers (`open-work.md`,
  `code-quality-review.md`) so nothing is double-counted or accidentally closed.
  Appendix B lists verified-clean areas — do not re-litigate them.

## 1. Overview

The subsystem is a Maven reactor (`../services`: shared + identity + messaging +
assets, Spring Boot 4.1.1, Java 25) on top of a single PostgreSQL 18 database
managed by Flyway migrations (`database/migrations/V001–V010`), plus maintained
documentation in `documentation/` and per-module READMEs.

Overall the architecture is sound and worth preserving: entity↔schema mappings
are exact, the messaging claim/retry state machine and its DB constraints agree,
the assets pipeline has solid path-traversal/upload/content-type defenses, and
identity's password/session handling is fundamentally correct. The findings are
mostly boundary hardening (input limits, error contracts, SMTP edge cases,
failure isolation) plus documentation drift and missing DB constraints.

The refactor therefore is **targeted hardening, not restructuring**. Highest
impact before any real traffic: email header injection (RS-A1), systematic
duplicate sends (RS-A2), committed role passwords (RS-E1), the worker wedge
(RS-A3), and the auth/error contract (RS-D1, RS-D2).

## 2. Scope

**In scope**
- `database/migrations/**` (and `../database/README.md`)
- `services/**` (shared, identity, messaging, assets: main + test sources,
  `application.yaml`, `pom.xml`, `Dockerfile`, module READMEs)
- `documentation/**` (doc-consistency items only)

**Out of scope (but see cross-boundary notes, section 5)**
- `web/**` (TanStack sites + packages) — producer/consumer contracts are noted
  where a change here would break or require them
- `legacy/**`, `ansible/**`, `infrastructure/**`, `.github/**`
- Feature work tracked in `open-work.md` (allowed senders, List-Unsubscribe,
  retention rules, rate limits) — referenced where a task touches the same code

## 3. Ground rules for the refactor

1. **Small changes, no rewrites.** Preserve the existing layering
   (controllers / services / repositories / domain / data) and the "keep these
   choices" list in `code-quality-review.md` (e.g. messaging's
   intake → claim → deliver → complete separation stays).
2. **Migrations are edited in place** during development
   (`../database/README.md`); they are not an upgrade path. Recreating the dev
   database after schema changes is the sanctioned workflow. Do not add
   "alter" migrations for V001–V010.
3. **Documentation changes ship with behavior changes** (module READMEs and,
   where relevant, `documentation/*.md`). This is a project rule.
4. **No secrets in git.** Credential literals must not survive any change.
5. **Authorization stays explicit** in every controller (the internal bearer
   token check must remain on all `/internal`/management endpoints; public reads
   stay visibility-scoped in assets).
6. **Structured outcomes, not parseable messages.** Error codes go through the
   problem-detail envelope; no exception-message scraping.
7. **Validation at the boundary.** Jakarta validation annotations on request
   records; the messaging delivery path re-validates claims before SMTP — keep
   both.
8. **Tests must stay green**: `mvn -f services/pom.xml test` (currently 66 test
   methods). New behavior gets unit tests; do not delete existing assertions.

## 4. Work packages and tasks

Severity: High = fix before relying on the workflow/deployment. Medium =
correctness/hardening gap. Low = cleanup.

Conflict key: `SAME-FILE:<package>` = serialize with that package.

---

### Package A — `services/messaging/**` (delivery pipeline)

#### RS-A1 — Email header injection via `subject`
- Severity: **High**
- Files: `../services/messaging/src/main/java/ch/oliumbi/messaging/data/requests/MessageCreateRequest.java` (line 14), `services/messaging/src/main/java/ch/oliumbi/messaging/services/delivery/EmailDelivery.java` (line 66), `.../services/intake/MessageIntakeService.java`
- Problem: `subject` is validated only with `@NotBlank` and written verbatim into
  the MIME header (`helper.setSubject`). Jakarta Mail requires the application to
  guarantee the subject has no line breaks; a queue row with
  `"Hi\r\nReply-To: attacker@evil.com"` smuggles headers or terminates the header
  block (phishing mail sent as the organization's domain). `sender`/`recipient`/
  `replyTo` are safe (`@Email` rejects CR/LF).
- Change: add `@Pattern(regexp = "[^\\r\\n]*")` and `@Size(max = 200)` to
  `subject`. The existing delivery-time `validate()` then rejects cleanly with
  `INVALID_REQUEST`. Optionally reject at intake too (intake currently trusts the
  row).
- Acceptance: a claim whose subject contains `\r` or `\n` is `Rejected` with
  detail `INVALID_REQUEST` and never reaches `prepare()`; unit test covers it.
- Cross-boundary: producers (`../web/packages/queue`) are unaffected (they send
  plain subjects); see section 5 item 1.

#### RS-A2 — Confirmed-sent message classified as retryable → duplicate email
- Severity: **High**
- Files: `../services/messaging/src/main/java/ch/oliumbi/messaging/services/delivery/EmailDelivery.java` (`failure()`, lines 77–91)
- Problem: all `MailException`s map to `RetryableFailure`. Spring's
  `JavaMailSenderImpl` throws `MailSendException("Failed to close server
  connection after message sending")` **after** SMTP accepted the message when
  `transport.close()` fails in `finally`; that case has an **empty**
  `getFailedMessages()` map, unlike genuine per-message send failures. The state
  machine then retries → guaranteed duplicate to the recipient.
- Change: in `failure()`, special-case `MailSendException` with empty
  `getFailedMessages()` → `new DeliveryResult.Sent()`; keep `RetryableFailure`
  for non-empty failed-message maps and connection failures.
- Acceptance: unit test with a `MailSendException` carrying an empty failed-map
  yields `Sent`; one with a populated failed-map yields `RetryableFailure`.
- Note: verify the exception semantics against Spring Framework 7.0.x used by
  Boot 4.1.1 before finalizing (section 7 item 8).

#### RS-A3 — One failure aborts the batch and can wedge the pipeline
- Severity: Medium (High impact when hit)
- Files: `.../services/processing/MessageWorker.java` (lines 29–56), `.../services/processing/DeliveryStore.java` (lines 78, 84, 99)
- Problem: `deliver()` wraps the whole batch loop in one try/catch; a
  `RuntimeException` from `store.claim()`/`store.complete()` (e.g. bare
  `orElseThrow()` in `DeliveryStore`) aborts the remaining batch. `findNext`
  always re-selects the oldest row, so one persistently failing row blocks all
  delivery every poll until manual DB intervention. `accept()` has the same
  shape.
- Change: per-item try/catch inside the loops (log, continue with next item);
  replace bare `orElseThrow()` with
  `orElseThrow(() -> new IllegalStateException("message/attempt " + id))`; add a
  minimal skip mechanism (e.g. skip the same message id for the remainder of the
  run) so a poisoned row cannot starve the queue.
- Acceptance: a claim/complete that throws for one row does not prevent later
  rows in the same batch from being processed; the poisoned row retries on a
  later poll.

#### RS-A4 — SMTP auth failure terminally kills messages
- Severity: Medium
- Files: `.../services/delivery/EmailDelivery.java` (lines 77–78)
- Problem: `MailAuthenticationException` → `Rejected` → `Failed` after one
  attempt. A rotated/expired `MESSAGING_SMTP_PASSWORD` or transient auth outage
  permanently fails every message with no alerting.
- Change: map `MailAuthenticationException` to `RetryableFailure` (operational
  dependency, not a content defect); the retry budget (5 attempts) still bounds
  it.
- Acceptance: unit test maps `MailAuthenticationException` to
  `RetryableFailure`; delivery README note updated.

#### RS-A5 — Lease expiry vs unbounded send time; recovery without backoff
- Severity: Medium
- Files: `.../services/processing/DeliveryStore.java` (lines 61–64),
  `.../configurations/WorkerProperties.java`, `../services/messaging/src/main/resources/application.yaml` (`worker.lease-duration`, `retry-delays`)
- Problem: a batch of 20 sends runs serially with 5 s×3 SMTP timeouts but
  unbounded DNS resolution, against a 5-minute lease; another instance (or the
  lease recovery path) can start attempt N+1 while the original send is still in
  flight. `Recover` schedules the next attempt immediately, with no backoff.
- Change: schedule recovered attempts at `now + retryDelays.get(...)` instead of
  immediately; document the invariant "send time budget must stay well below
  lease duration" in the module README (and consider asserting it at startup).
- Acceptance: recovered claim is not immediately re-sent; state-machine tests
  updated; README documents the lease/send-time relationship.

#### RS-A6 — Opportunistic STARTTLS; misleading `MESSAGING_SMTP_TLS`
- Severity: Medium
- Files: `../services/messaging/src/main/resources/application.yaml` (lines 26–27)
- Problem: `mail.smtp.starttls.enable` without `mail.smtp.starttls.required`
  silently falls back to plaintext (including AUTH credentials). No implicit-TLS
  (465) path. `.env.prod` sets `MESSAGING_SMTP_TLS=true`, which reads stricter
  than it is.
- Change: add `"mail.smtp.starttls.required": ${MESSAGING_SMTP_TLS_REQUIRED:false}`
  (or redefine the existing flag with a clear name), document exact semantics in
  the README; note the new variable for the env templates (infrastructure —
  out of scope to edit, see section 5).
- Acceptance: property present, README explains enable-vs-required, and the
  default in dev remains working against mailpit.

#### RS-A7 — `type` handling is accidental
- Severity: Medium
- Files: `.../data/requests/MessageCreateRequest.java` (line 10),
  `.../repositories/QueuedMessageRepository.java` (lines 12–17),
  `.../services/intake/MessageIntakeService.java`
- Problem: `@Pattern(regexp = "email")` matches only by full-match coincidence;
  `type` is never consulted at delivery; `findNext` has no `type` filter — a
  non-`email` queue row is consumed and terminally rejected instead of being
  left for a future consumer.
- Change: replace the pattern with an explicit literal check (custom constraint
  or `@Pattern(regexp = "\\Aemail\\z")` + message); restrict intake/`findNext` to
  `type = 'email'`.
- Acceptance: a row with `type = 'sms'` is left in `queue.message` untouched;
  documented in the producer contract section of the README.

#### RS-A8 — No size limits on message fields
- Severity: Medium
- Files: `.../data/requests/MessageCreateRequest.java`, `.../domain/DeliveryClaim.java`
- Problem: `subject`/`text`/`html` are unbounded `text`; oversized subjects
  produce SMTP-illegal header lines (>998 bytes) and huge bodies are held in
  memory in `DeliveryClaim`.
- Change: `@Size` bounds (subject ≤ 200, `text`/`html` ≤ a few hundred KB — pick
  concrete values and document them) enforced at intake and in delivery
  validation.
- Acceptance: oversized input is rejected (400 at intake, `INVALID_REQUEST` at
  delivery) instead of failing at SMTP.

#### RS-A9 — Scheduler starvation and shared poll delay
- Severity: Low
- Files: `.../services/processing/MessageWorker.java` (lines 27, 40), `.../configurations/WorkerConfiguration.java`, `application.yaml`
- Problem: both `@Scheduled` methods share `poll-delay-ms` and the single default
  scheduler thread; a full delivery batch starves intake.
- Change: separate accept/deliver delays and an explicit
  `ThreadPoolTaskScheduler` with 2 threads.
- Acceptance: both tasks run independently; config documented.

#### RS-A10 — Error contract for unknown `status` filter
- Severity: Low (decision-shaped)
- Files: `.../services/MessageService.java` (lines 33–38)
- Problem: unknown `status` silently returns an empty page while an unknown sort
  property returns 400. `messaging/README.md` documents the current behavior.
- Change: either return 400 on unknown status (aligning with RS-D2's contract)
  or keep and document. Default: keep behavior, no change beyond README unless
  the orchestrator decides otherwise.

#### RS-A11 — Operator visibility gaps in `MessageResponse`
- Severity: Low
- Files: `.../data/responses/MessageResponse.java`
- Problem: the list view omits `sender` and `lockedAt`; operators cannot see the
  From actually used or debug leases.
- Change: include `sender` and `lockedAt`.
- Acceptance: response shows both; no attempt collections leak into the list.

#### RS-A12 — Failure logging loses diagnostics (messaging part)
- Severity: Low (part of R23)
- Files: `.../services/processing/MessageWorker.java` (lines 36, 55), `.../services/processing/DeliveryStore.java`, `.../services/delivery/EmailDelivery.java`
- Problem: exceptions are logged with class name only; `EmailDelivery` never
  logs the caught exception at all. Programming errors and infrastructure
  failures become indistinguishable.
- Change: log full stack traces (or exception + cause chain) at the failure
  points; keep personal data out of messages (codes/details already do this).
- Acceptance: a simulated SMTP failure produces a log line with the cause chain.

#### RS-A13 — Module README updates (messaging)
- Severity: Low
- Files: `../services/messaging/README.md`
- Problem: line 90 claims "The reactor does not yet contain permanent automated
  tests" (six suites exist); behavior changes from RS-A1–A9 need documenting.
- Change: fix the tests claim; update failure-mapping, retry and producer
  contract sections per the tasks above.
- Conflicts: none (README owned by this package).

---

### Package B — `services/identity/**`

#### RS-B1 — Permission grant is check-then-act; breaks documented idempotency
- Severity: Medium
- Files: `../services/identity/src/main/java/ch/oliumbi/identity/services/PermissionService.java` (lines 36–38)
- Problem: `existsById` then `save` races; two concurrent grants hit the
  `(account_id, permission)` PK and surface as 409, contradicting
  `identity/README.md` ("Grant and revoke are idempotent").
- Change: catch `DataIntegrityViolationException` around the save and return
  success (or `INSERT ... ON CONFLICT DO NOTHING` via `@Modifying` query).
- Acceptance: double grant (sequential or concurrent) returns success both
  times; unit test covers the constraint-violation path.

#### RS-B2 — Login timing side channel (account enumeration)
- Severity: Medium
- Files: `.../services/SessionService.java` (lines 49–54), `.../services/PasswordService.java`
- Problem: unknown account returns 401 immediately; known account pays a full
  BCrypt (cost 12) comparison, so response time distinguishes existing accounts.
- Change: when the account is absent, run `passwordEncoder.matches(...)` against
  a fixed dummy BCrypt hash before throwing 401.
- Acceptance: both paths perform one BCrypt comparison; unit test asserts the
  encoder is exercised on the unknown-account path.

#### RS-B3 — Session lifecycle: revoke idempotency, purge, write amplification
- Severity: Medium
- Files: `.../services/SessionService.java` (lines 67–89), `.../data/entities/AccountSession.java`, `.../repositories/AccountSessionRepository.java`
- Problem: (a) revoking an already-revoked/expired token throws 401 — a retried
  revoke after a timeout fails; (b) expired/revoked sessions are never purged —
  rows accumulate forever; (c) `validate` writes `lastSeenAt` on every call.
- Change: (a) make revoke a no-op 204 for unknown/already-revoked tokens (a
  bulk `UPDATE ... WHERE token_hash = :h AND revoked_at IS NULL` is fine);
  (b) add a scheduled purge (`@EnableScheduling` like messaging) deleting
  sessions past `expires_at + retention`; pick a retention window (default
  suggestion: 30 days) and document it; (c) throttle `lastSeenAt` updates (e.g.
  only when older than a few minutes).
- Acceptance: revoke of a dead token returns 204; purge test proves old rows are
  deleted and unexpired rows survive; `validate` still returns correct actor.
- Cross-boundary: retention wording should eventually match
  `open-work.md` "Set retention rules for messages, tokens and personal data" —
  document the chosen values in the module README.

#### RS-B4 — Delete leftover debug `main` printing a bcrypt of "root"
- Severity: Low
- Files: `.../configurations/PasswordConfiguration.java` (lines 15–17)
- Problem: dead debug code hinting at a bootstrap password "root" (contradicts
  `identity/README.md` "no hardcoded bootstrap password") and using default
  strength 10 instead of the configured 12.
- Change: delete the method.

#### RS-B5 — Unbounded request strings
- Severity: Medium
- Files: `.../data/requests/AccountCreateRequest.java`, `AccountUpdateRequest.java`, `PermissionGrantRequest.java`, `PermissionRevokeRequest.java`
- Problem: no `@Size` on `permission`, `name`, `email`; oversized `permission`
  (>~2.7 KB) fails at the index and surfaces as 409/500 instead of 400.
- Change: `@Size` (suggestion: permission ≤ 255, name ≤ 255, email ≤ 320) on all
  request components.
- Acceptance: oversized input yields 400 with field-level validation detail.

#### RS-B6 — `GET /account` is unbounded (R29)
- Severity: Low
- Files: `.../controllers/AccountController.java` (lines 39–43), `.../services/AccountService.java` (lines 38–43)
- Problem: `findAll()` with no pagination over a PII table.
- Change: add `Pageable` (consistent with messaging/assets) or a cap. Check
  Studio's web caller first (section 5 item 3).
- Acceptance: bounded response; caller still works.

#### RS-B7 — Ambiguous 401s on session endpoints
- Severity: Low
- Files: `.../controllers/SessionController.java` (lines 41–56), `.../services/SessionService.java` (lines 72–73, 85–86)
- Problem: "unknown/expired session token" and "bad internal bearer token" both
  return a bare 401; callers cannot distinguish a dead session (sign in again)
  from a broken integration.
- Change: distinct problem detail for the session-token case (keep status 401).
- Conflicts: `SAME-FILE:D` if RS-D2 reworks the envelope — implement after or
  together with RS-D2.
- Cross-boundary: `../web/packages/http-client` currently drops problem details
  (R22); do not design around web until that is addressed.

#### RS-B8 — Module README updates (identity)
- Severity: Low
- Files: `../services/identity/README.md`
- Problem: line 52 names non-existent `NormalizeService` (actual:
  `IdentityInputNormalizer`); lines 53–54 say session validity fetches its
  account "by an entity graph" (it is `JOIN FETCH` in `findValidSession`; the
  `@EntityGraph` is on `findDetailedById`); line 73 claims "Automated tests are
  intentionally deferred" (four suites exist); line 69 claims all errors include
  a correlation ID (only half true until RS-D2).
- Change: correct all four statements; document behavior changes from RS-B1–B5.

---

### Package C — `services/assets/**`

#### RS-C1 — DELETE with mismatched `site` silently returns 204
- Severity: Medium
- Files: `.../services/ImageService.java` (lines 94–101), `.../services/DocumentService.java` (lines 90–97), `.../services/AssetDeletionService.java` (lines 24–28)
- Problem: if the row exists under a different site, `findLockedByIdAndSite` is
  empty, the supplier returns `false`, and the endpoint returns 204 as if the
  deletion succeeded — while `get`/`visibility` return 404 for the same
  mismatch.
- Change: distinguish "not found / wrong site" (404, consistent with `get`)
  from "deleted" inside the supplier (e.g. throw the 404 when the row lookup by
  id alone succeeds but the site does not match).
- Acceptance: wrong-site delete → 404 and no deletion; correct delete → 204;
  wrong-id delete → 404.
- Cross-boundary: check Studio's web delete callers before changing (section 5
  item 3).

#### RS-C2 — Missing variant surfaces as bare 500
- Severity: Medium
- Files: `.../services/ImageService.java` (line 80; scan for sibling
  `orElseThrow()` without mapper)
- Problem: `variants.findByImageIdAndSize(...).orElseThrow()` throws
  context-free `NoSuchElementException` → generic 500 for what is a controlled
  condition.
- Change: `orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant is unavailable"))`.
- Acceptance: unknown size on an existing image → 404 problem detail.

#### RS-C3 — `StorageFiles.remove` can throw out of `StagedUpload.close`
- Severity: Low
- Files: `.../services/storage/StorageFiles.java` (lines 61–65),
  `.../services/storage/LocalBlobStorage.java` (lines 136–138)
- Problem: `checkPath` throws `IllegalArgumentException` on a stray symlink;
  `close()` catches only `UncheckedIOException`, so the exception propagates and
  can mask the original processing exception in try-with-resources.
- Change: catch `RuntimeException` in `close()` (log-and-continue) and/or make
  `remove` skip-and-log offending entries.
- Acceptance: a tree containing a symlink does not mask the primary exception;
  cleanup still removes the rest.

#### RS-C4 — Orphan sweep holds the upload lock across DB calls and deletes (R18)
- Severity: Low
- Files: `.../services/storage/OrphanCleanup.java` (lines 47–62)
- Problem: metadata checks and up to 200 tree deletions run inside
  `synchronized (active)`, the same monitor uploads need; a large sweep stalls
  all uploads. Bounded removals but unbounded scanning.
- Change: snapshot candidates, do DB checks/deletions outside the lock
  (re-checking `active` only at the delete decision), bound examined entries or
  elapsed work, resume across runs.
- Acceptance: upload staging is not blocked during a sweep; active-upload
  protection still holds (test with an in-flight id).

#### RS-C5 — Oversized multipart spooled before the image limit applies
- Severity: Low
- Files: `.../services/storage/LocalBlobStorage.java` (lines 59–76), `application.yaml` (multipart limits), `.../services/ImageService.java` (line 53)
- Problem: 50 MB multipart limit; the 20 MiB image cap is enforced only during
  copy, after Tomcat spools to temp.
- Change: reject on `file.getSize() > maxBytes` before streaming where the size
  is known up front; keep the streaming cap as defense in depth.
- Acceptance: oversized upload is rejected without staging the full body.

#### RS-C6 — Variant file aliasing vs documented storage layout
- Severity: Low
- Files: `.../services/processing/ImageRenditions.java` (lines 26–37), `.../services/processing/ImageEncoder.java` (lines 21–26), `../services/assets/README.md` (storage layout section)
- Problem: when presets clamp to the same width, later sizes reuse the first
  size's file (`xl` and `2xl` rows can carry `file_key = "md.jpg"`), which
  diverges from the README's one-file-per-variant layout and will surprise
  future per-variant regeneration.
- Change: document the aliasing in the README and add a code comment at the
  alias point (behavior itself matches `IMPLEMENTATION_PLAN.md` — do not
  "fix" the aliasing without a regeneration requirement).

#### RS-C7 — Master byte targets are untracked
- Severity: Low
- Files: `.../services/processing/ImageEncoder.java` (lines 17–26), `../services/assets/IMPLEMENTATION_PLAN.md` (line 83)
- Problem: the plan promises ~2 MiB JPEG / ~8 MiB PNG master tuning targets; the
  encoder performs a single 0.90 encode and never reports resulting bytes.
- Change: log master byte counts at creation so targets can be validated, or
  drop the claim from the plan.

#### RS-C8 — Test gap in the processing pipeline (M1)
- Severity: Medium (verification debt)
- Files: `services/assets/src/test/java/**`, per `IMPLEMENTATION_PLAN.md` lines 31, 92–96
- Problem: only `StorageFilesTest` and `ImageSizeTest` exist; the processing
  pipeline, cache headers and partial-failure paths have zero coverage while
  README claims (metadata stripping, orientation, immutability) are unverified.
- Change: add the representative tests the plan lists: golden-file encode tests
  asserting no EXIF/XMP remains, an orientation matrix for JPEG+PNG,
  transparency preservation, APNG/MPF rejection, cache-header assertions, and a
  create/delete failure-injection test.
- Acceptance: the tests run in `mvn test` and cover at least those six
  behaviors. (Can be dispatched as its own subagent; touches test tree only.)

---

### Package D — `services/shared/**` + controller auth/error contract

#### RS-D1 — Missing `Authorization` header yields 400, not 401
- Severity: **High**
- Files: all controllers — `services/identity/src/main/java/ch/oliumbi/identity/controllers/*.java`, `services/messaging/.../controllers/MessageController.java`, `services/assets/.../controllers/{ImageController,DocumentController}.java`
- Problem: `@RequestHeader(HttpHeaders.AUTHORIZATION)` is required, so absence
  raises `MissingRequestHeaderException` → 400 via the parent handler, while a
  wrong token gives 401. Contradicts every module README ("All endpoints
  require `Authorization: Bearer …`").
- Change: declare the header `required = false` and let
  `BearerTokenVerifier.requireValid(...)` return 401 for null (it already
  does), across all endpoints mechanically.
- Acceptance: request without the header → 401 problem detail; with wrong token
  → 401; with correct token → normal behavior. Controllers are owned by this
  package; packages A/B/C must not edit controller files.

#### RS-D2 — Two inconsistent error envelopes; no correlation ID on most errors
- Severity: Medium
- Files: `../services/shared/src/main/java/ch/oliumbi/shared/web/ApiExceptionHandler.java` (lines 48–63)
- Problem: `errorId` is stamped only by `problem()`; expected 401/404/409s
  thrown as `ResponseStatusException` flow through `ResponseEntityExceptionHandler`
  with no `errorId` and no logs. The same 409 arrives in two shapes. This
  contradicts `identity/README.md` ("Errors include a correlation ID").
- Change: add handling for `ResponseStatusException` (e.g. an
  `@ExceptionHandler` that stamps `errorId` and logs 4xx conflicts) so every
  error response carries `errorId`; keep the existing detail texts and statuses.
- Acceptance: 401/404/409 problem responses include `errorId`; log lines exist
  for 409s; existing tests still pass.
- Cross-boundary: the envelope is consumed by `../web/packages/http-client` (which
  currently drops it, R22). Only *add* fields; do not rename/remove existing
  ones in this refactor (section 5 item 2).

#### RS-D3 — `problem()` log drops the cause chain (R23)
- Severity: Low
- Files: `../services/shared/src/main/java/ch/oliumbi/shared/web/ApiExceptionHandler.java`
- Problem: logs class name + top-level stack only; cause chain discarded.
- Change: include exception class + cause chain (redact raw messages if they can
  contain parameters/PII, per the R23 wording).
- Acceptance: a wrapped exception logs both layers.

#### RS-D4 — `/docs` and actuator exposure
- Severity: Low
- Files: the three `application.yaml` files (`springdoc`, `management` blocks)
- Problem: swagger-ui at `/docs` is unauthenticated on services that expose
  management APIs; `/actuator/health` is unauthenticated (health is intentionally
  used by compose checks — see `open-work.md` technical debt; do not break it).
- Change: disable springdoc outside dev (profile-gated) or put it behind the
  internal token; keep `/actuator/health` reachable for compose.
- Acceptance: health still answers without auth; `/docs` is unavailable in the
  production profile.
- Conflicts: `SAME-FILE:A` (messaging `application.yaml` — A edits the
  `spring.mail.properties` block, D edits `springdoc`/`management`; serialize
  the edits or split by key).

---

### Package E — `database/migrations/**`

#### RS-E1 — Roles created with passwords committed to git
- Severity: **High**
- Files: `../database/migrations/V001__schemas.sql` (lines 12–22), see also `infrastructure/.env.dev` / `compose.dev.yaml` defaults (out of scope, note only)
- Problem: V001 creates eight `LOGIN` roles with passwords like
  `identity_password`; those literals are public (repo + `compose.dev.yaml`
  defaults), and the migrations run in production via `apps-migrate`
  (`compose.prod.yaml:60`). Any fresh production database gets known
  credentials. `open-work.md`'s "replace development secrets / update roles and
  credentials" does not fix the mechanism.
- Change (pick one, default to the first): create roles `NOLOGIN` without
  passwords in the migration and let ops set credentials (Ansible vault →
  `ALTER ROLE`), or drop role creation from migrations entirely and provision
  roles in ops tooling. Keep the schema/grant structure. Document the new
  bootstrap step in `../database/README.md`.
- Acceptance: `git grep -iE "password '"` over `../database` returns nothing; a
  clean migrate + documented role setup yields working service connections in
  dev (adjust `.env.dev` guidance in the README, do not edit
  `infrastructure/`).
- Cross-boundary: ansible/infrastructure follow-up is tracked as its own item
  (section 5 item 4). Coordinate before merging so deployments keep working.

#### RS-E2 — Domain constraints missing (R07)
- Severity: Medium
- Files: `../database/migrations/V008__jublawoma.sql`, `V009__unclet.sql`, `V010__zelglihof.sql`
- Problem: value rules are not enforced: `donation_item.quantity/step` allow
  0/negative (`numeric`), `review.stars` allows any integer,
  `product_variant.quantity` allows negative stock, `status` columns
  (`subscriber`, `inquiry`, `product_reservation`, `campaign`) are free text,
  and no `starts_at < ends_at` range checks on promotions/events/donations/
  product windows. Drizzle `enum` hints do not constrain PostgreSQL.
- Change: add `CHECK` constraints matching the agreed value rules (stars 1–5;
  quantity/step > 0; quantity ≥ 0 or NULL; status IN (...); date ranges). Keep
  request validation in the web layer for feedback — these are the backstop.
  Because migrations are edited in place, add the constraints to the owning
  files and recreate the dev DB.
- Acceptance: invalid rows are rejected at the DB; existing seed/dev fixtures
  still load; the constraint list is documented in `../database/README.md`.
- Cross-boundary: must be applied **together with** validating imported legacy
  data (`open-work.md` "check constraints, indexes and legacy imports before
  live data"). Do not enable constraints that would reject planned import data
  without flagging it.

#### RS-E3 — Missing indexes for FK/lifecycle columns
- Severity: Low
- Files: `../database/migrations/V003__identity.sql`
- Problem: `identity.account_session.account_id` (FK, `ON DELETE CASCADE`) and
  `expires_at` have no index; combined with the missing purge (RS-B3) the table
  only grows.
- Change: add indexes on `(account_id)` and `(expires_at)` in V003.
- Acceptance: recreate DB applies cleanly; `explain` for session purge and
  account delete shows index use.

#### RS-E4 — Queue privileges exceed the producer interface (R17)
- Severity: Medium (decision-gated)
- Files: `../database/migrations/V001__schemas.sql` (lines 50–58), `V002__queue.sql`
- Problem: every site role gets `SELECT, INSERT` on **all** queue tables; the
  queue holds recipients, bodies and site identifiers with no site isolation, so
  separate site roles can read each other's queued personal data and write
  arbitrary sender/recipient rows (feeding RS-A1's injection surface).
- Change (requires decision — see section 6): narrow to `INSERT` (plus columns
  needed for `ON CONFLICT`) and enforce site ownership for producer writes
  (e.g. per-site views or column-level grants). Keep consumption with messaging.
- Acceptance: a site role can enqueue only its own site's messages and cannot
  read another site's rows; messaging retains full access.
- Note: execute only after the orchestrator confirms the mechanism choice.

#### RS-E5 — `unsubscribe_token` stored in plaintext while confirmations are hashed
- Severity: Low (decision-gated)
- Files: `../database/migrations/V010__zelglihof.sql` (lines 97–108)
- Problem: `confirmation_token_hash` is hashed, `unsubscribe_token` is stored
  raw — inconsistent handling of the same class of secret.
- Change: hash unsubscribe tokens too (lookup by hash of the presented token),
  or document the deliberate exception.
- Acceptance: consistent policy documented in `../database/README.md` or the
  zelglihof notes.
- Cross-boundary: `../web/packages/zelglihof-data` performs token lookups; changing
  storage shape is a contract change (section 5 item 5). Explore before doing.

#### RS-E6 — `text` prices vs "exact numerics for money"
- Severity: Low (decision-gated)
- Files: `../database/migrations/V010__zelglihof.sql` (lines 53, 72), `documentation/architecture.md` (line 94)
- Problem: `product_variant.price` / `product_reservation.variant_price` are
  `text` while the architecture convention says exact numerics for money.
  Likely deliberate ("display-only CHF price wording" in `open-work.md`), but
  the convention contradicts it.
- Change: prefer documentation-side resolution — amend the architecture
  convention to state that display-only prices are text and numeric money is
  required as soon as amounts are computed. Schema change only if the owner
  says prices will become computational.

---

### Package F — `documentation/**` + `../services/README.md`

#### RS-F1 — Stale "no tests" statements
- Severity: Low
- Files: `../services/README.md` (line 39)
- Problem: "The reactor currently has no permanent automated tests" — 66 test
  methods exist (`open-work.md` is correct). (The same claim in
  `services/identity/README.md:73` and `services/messaging/README.md:90` is
  fixed by RS-B8 / RS-A13.)
- Change: state that unit tests exist per module, note the remaining follow-ups
  (integration tests against real PostgreSQL, style checks, CI).

#### RS-F2 — Architecture component table names the wrong schemas
- Severity: Low
- Files: `architecture.md` (lines 54–56)
- Problem: "account schema", "communication schema", "media schema" — the actual
  schemas (`V001`) are `identity`, `messaging`, `assets`.
- Change: correct the "Owns" column.

#### RS-F3 — Money convention wording
- Severity: Low
- Files: `architecture.md` (line 94)
- Problem: same as RS-E6 — do whichever side the owner decides (section 6).
- Conflicts: `SAME-FILE:E` if the schema option is chosen (then the doc edit is
  the same change).

#### RS-F4 — Open decisions O-006 / O-010 are stale (prepare only)
- Severity: Low (needs owner sign-off — see section 6)
- Files: `decisions.md` (lines 78–89)
- Problem: O-010 says the migration tool is undecided while Flyway is shipped
  and schema-per-capability exists in V001; O-006 says the auth model is open
  while identity implements local passwords + sessions.
- Change: draft the closing text (tool = Flyway, migrations in
  `../database/migrations`, edited in place pre-launch; auth = local password
  accounts, session tokens hashed, internal bearer for services) but leave the
  checkbox state to the owner.

#### RS-F5 — Two open-work trackers overlap (prepare only)
- Severity: Low (needs owner sign-off)
- Files: `open-work.md`, `documentation/code-quality-review.md`
- Problem: `code-quality-review.md` keeps 28 open findings with checkboxes while
  `open-work.md` claims to be the only unresolved-work list; overlapping items
  (submission retries, unsaved edits, role checks) can drift apart.
- Change: proposal only — make code-quality-review purely historical and move
  live checkboxes into open-work. Do not execute without owner confirmation.

---

## 5. Cross-boundary dependencies (out of scope to edit — coordinate)

1. **Queue producer** (`../web/packages/queue/src/email.ts`): produces `subject`,
   `sender`, `recipient` for `queue.message`. RS-A1/A8 harden the service side;
   no web change required, but if web-side validation is added later it must not
   be the only gate.
2. **Error envelope consumers** (`../web/packages/http-client`): R22 shows the
   client drops problem details and `errorId`. RS-D2 only **adds** fields;
   a rename/shape change would break Studio's error handling — defer to a
   coordinated contract change.
3. **Studio web callers** of assets delete/content (`web/sites/studio/...`) and
   identity `GET /account`: RS-C1 (204→404), RS-C2 (500→404) and RS-B6
   (pagination) change observable behavior; verify callers before merging
   (Studio is in a sibling workstream — announce the contract change).
4. **Ops/infra follow-ups** (ansible/, infrastructure/): RS-E1 requires role
   provisioning from the vault and an `.env` template note; RS-A6 wants a new
   SMTP env var in `infrastructure/.env.*` templates; `open-work.md` already
   tracks "update roles and credentials on existing volumes". Do not edit those
   files here; record the required follow-up in the PR/summary.
5. **Subscriber tokens** (`../web/packages/zelglihof-data`): RS-E5 storage change
   alters the lookup contract (plain token → hash lookup). Explore first.
6. **DB constraints vs imports** (RS-E2): legacy import tooling (future work per
   `migration.md`) must validate against the new constraints;
   flag any constraint that would reject planned legacy data.

## 6. Decisions the orchestrator/owner must make (do not decide in a task)

- **D-1** Queue privilege narrowing mechanism (RS-E4): column grants vs per-site
  views vs application-level site checks only.
- **D-2** Unsubscribe token storage (RS-E5): hash vs documented exception.
- **D-3** Price policy (RS-E6/RS-F3): text display-only (doc fix) vs numeric.
- **D-4** Session purge retention window (RS-B3) and, more broadly, the token /
  message retention rules referenced in `open-work.md`.
- **D-5** Unknown-status behavior in messaging list (RS-A10): keep empty page or
  return 400.
- **D-6** `/docs` policy (RS-D4): profile-gated vs token-protected.
- **D-7** Role provisioning ownership after RS-E1: migrations vs Ansible.
- **D-8** Doc tracker consolidation (RS-F5) and closing O-006/O-010 (RS-F4).

## 7. Details worth exploring before/during the work

1. **Producer-side validation** in `../web/packages/queue` — what it already checks
   (subject length, addresses) so service-side limits (RS-A8) pick compatible
   values and do not break existing producers.
2. **Spring's `JavaMailSenderImpl.doSend` failure semantics** for the exact Boot
   4.1.1 / Framework 7.0.x artifacts in the local repo — confirm the
   empty-`getFailedMessages()` signature of the post-accept close failure
   (RS-A2) before coding the special case.
3. **Multi-instance expectations** for messaging: `compose.prod.yaml` topology
   (single instance?) decides how much of RS-A5 is about leases across
   instances vs. self-recovery within one process. The assets README documents a
   single-instance storage limitation; messaging should document its own stance.
4. **Studio's current calls** to assets delete/content and identity account list
   (RS-C1/C2/B6) — exact request/response usage before changing semantics.
5. **`../web/packages/zelglihof-data` token lookups** (RS-E5): how the confirm and
   unsubscribe flows read the tokens today; whether hashed lookup is a small
   change or a contract change.
6. **Existing dev/fixture data** (any seed SQL, `../services/assets/media`,
   workshop DBs) that RS-E2's constraints must accept; also whether the
   `check constraints, indexes and legacy imports` open-work item has import
   samples to validate against.
7. **Whether `identity` should adopt `@EnableScheduling`** for the purge
   (RS-B3) — check how messaging wires scheduling (`WorkerConfiguration`) and
   mirror it, or introduce a tiny shared scheduling config in `shared`.
8. **Auth-error envelope consumers**: who parses problem details today (Studio
   messages, logs, monitoring) so RS-D2's `errorId` addition is observably
   useful and nothing parses the old shape.
9. **`type = 'email'` future channels** (RS-A7): the README says "add another
   adapter when a second channel is required" — confirm the intake filter
   should therefore be an allow-list of the current channel only.
10. **Rate limiting for login** (open-work, out of scope here): RS-B2's timing
    fix and a future proxy rate limit interact; note the chosen login limits so
    the two are not designed in isolation.

## 8. Verification & acceptance (per package and overall)

1. `mvn -f services/pom.xml test` — all existing 66 tests green plus new tests
   for each behavior change.
2. `mvn -f services/pom.xml -pl <module> -am package` for each touched module;
   `docker compose -f infrastructure/compose.dev.yaml config` still validates.
3. Database: recreate a scratch DB and apply V001–V010 in order (per
   `../database/README.md`); verify grants (site roles cannot read other sites'
   queue rows after RS-E4), constraints reject bad rows (RS-E2), and services
   connect with vault-provisioned roles (RS-E1).
4. Negative tests: request without `Authorization` → 401 (RS-D1); CRLF subject
   never reaches SMTP (RS-A1); wrong-site delete → 404 (RS-C1).
5. Docs updated in the same change; no credential literals anywhere new
   (`git grep`); no TODO/FIXME introduced.
6. Report per task: what changed, tests added, decisions applied (D-*), and any
   cross-boundary follow-ups created.

## Appendix A — mapping to existing trackers (for dedup)

| This report | Existing tracker | Status there |
| --- | --- | --- |
| RS-E2 | R07 (`code-quality-review.md`) | open |
| RS-E4 | R17 | open |
| RS-C4 | R18 | open |
| RS-A12 + RS-D3 | R23 | open |
| RS-B6 | R29 | open |
| RS-D4 (image/runtime pinning note) | R34 | open |
| RS-A1, RS-A2, RS-A3–A9, RS-B1–B5, RS-C1–C3, RS-D1, RS-D2, RS-E1 | new (not in trackers) | — |
| RS-B3 (retention part) | `open-work.md` "Set retention rules for messages, tokens and personal data" | open |
| RS-A8 + RS-A1 (allowed senders) | `open-work.md` "Add allowed senders per site and List-Unsubscribe headers" | open |
| RS-C8 | `open-work.md` "Java unit tests … follow-ups" + `IMPLEMENTATION_PLAN.md` verification list | open |
| RS-F1 | contradicts `open-work.md` "Java unit tests exist … 66 tests" (correct there) | fix the stale side |

## Appendix B — verified clean, do not re-litigate

- JPA entity ↔ migration mappings in all three services are exact (names,
  types, PKs, FKs, cascades).
- Messaging claim/complete locking (`FOR UPDATE SKIP LOCKED`), attempt-number
  stale detection, backoff indexing and the DB CHECK constraints vs
  `DeliveryState` invariants are sound.
- Assets: path traversal defenses (UUID-shard paths, key regex, root containment,
  symlink rejection), magic-byte + container-walk upload validation (PNG/APNG,
  JPEG/MPF), pixel/size caps, PDF byte preservation and safe serving
  (`application/pdf`, `attachment`, `nosniff`), visibility scoping before
  caching, deletion/orphan lifecycle with grace period — all correct.
- Identity: BCrypt cost 12, 72-byte password cap behavior, 256-bit tokens stored
  as SHA-256 with constant-time compare, identical 401 for unknown account vs
  wrong password (status level), pessimistic lock closing the login-vs-password
  change race, `@DynamicUpdate` preventing `lastSeenAt` from resurrecting
  `revoked_at`.
- `ResponseStatusException` statuses survive `ApiExceptionHandler` (framework
  depth ordering) — the gap is only the missing `errorId`/logs (RS-D2).
- Image writer compression-type handling, EXIF orientation transforms, JPEG/PNG
  alpha normalization and the cache-header emission behavior are correct on the
  current framework version.
