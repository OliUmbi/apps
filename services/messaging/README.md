# Messaging

Messaging consumes database requests and sends prepared emails. HTTP is read-only history.
Initial migrations are edited in place during development; recreate the database after schema changes.

## Read the implementation in this order

1. `domain/DeliveryState.java`: the four immutable states, each with only its relevant timestamps.
2. `domain/DeliveryResult.java`: `Sent`, `RetryableFailure(detail)`, or `Rejected(detail)`.
3. `domain/DeliveryStateMachine.java`: all claim/recovery/completion decisions, with no I/O or mutation.
4. `services/processing/DeliveryStore.java`: row locks, attempt history and atomic persistence of decisions.
5. `services/processing/MessageWorker.java`: claim, send, complete.

`services/intake/MessageIntakeService` handles the separate atomic inbox handoff.
`services/delivery/EmailDelivery` validates annotated content and translates SMTP results into
typed outcomes. Its `EmailDelivery` port is explicitly email-only; there is no speculative channel
router. Add another adapter/port when a second channel is actually required.

## State machine

| Current state | Event | Next state | Attempt history |
|---|---|---|---|
| Pending | Due and budget available | Processing | Start next attempt |
| Pending | Not due | Unchanged | None |
| Processing | Sent | Sent | Sent |
| Processing | Retryable failure, budget available | Pending at retry time | Retry with detail |
| Processing | Rejected or retries exhausted | Failed | Rejected/failed with detail |
| Processing | Lease expired, budget available | Pending at retry time (backoff) | Abandon previous; schedule next attempt |
| Processing | Lease expired, retries exhausted | Failed | Abandon previous |
| Any state | Completion from an old/non-active claim | Unchanged | No overwrite |
| Sent/Failed | Poll | Unchanged | None |

A closed exhausted message is distinct from an empty queue, so the worker continues its batch.
The attempt number identifies the claim. A delayed worker cannot finish a newer attempt.
`Message.apply(state)` is the only mutation boundary for status/lease/count/timestamps.
The database also checks valid combinations. Audit timestamps remain Hibernate-managed.

Retry delays, lease duration and batch size live under `messaging.worker` in application.yaml.
Four delays mean five total attempts. Defaults: 2, 4, 8, 16 minutes; five-minute lease; 20 items.
The state machine receives explicit time and settings, so it can be verified without Spring or a database.

## Retries, leases and the send-time budget

A retryable failure schedules the next attempt at `now + retry-delays[n]`. A lease expiry is not a
delivery failure: the expired attempt is abandoned and the *next* attempt is scheduled with the same
backoff (`now + retry-delays[n]`), never immediately. The original send may still be in flight past
the lease, and an immediate re-send would turn a slow send into a duplicate email.

**Invariant: the worst-case send time of one batch must stay well below `worker.lease-duration`.**
A batch of 20 sends runs serially against three five-second SMTP timeouts
(`mail.smtp.connectiontimeout`/`timeout`/`writetimeout`) plus unbounded DNS resolution; with the
defaults this budget can approach the five-minute lease. If sends are slow, either lower
`worker.batch-size` or raise `worker.lease-duration`. A send that outlives its lease is still
ambiguous — see below — so the budget is a correctness margin, not just a tuning knob.

## Transactions and failures

Intake locks one inbox row using `SKIP LOCKED`, inserts a delivery record if its `queueId` is new,
and removes the inbox row in the same transaction. The delivery ID is independently generated.
The unique `queue_id` preserves replay protection after the source row is consumed; it is not a
foreign key to a deleted row. Producers must reuse their request UUID after an uncertain commit.

A claim and its new attempt commit together before SMTP starts. Completion finishes the attempt
and applies the next state in another transaction. Database failures roll back together.
SMTP-success/process-crash remains inherently ambiguous: recovery can send a duplicate. No
state machine can undo an external SMTP send. There is no administrator retry endpoint or alert
transport yet; terminal failures remain inspectable and safe failure codes are logged.

Both worker loops isolate their items: one row that throws during claim, intake, send or complete is
logged with its full cause chain and skipped for the remainder of that poll; the batch moves on and
the row is retried on a later poll. A missing message/attempt row surfaces as a descriptive
`IllegalStateException` naming the message/attempt instead of a bare `NoSuchElementException`.

All delivery failures, including content validation, follow the same attempt lifecycle.
Attempt history is the sole source of failure details: `detail` is structured JSON containing
`code` and `message`, never raw exceptions or credentials. Message rows do not duplicate it.
A rejected message has a normal rejected first attempt; there is no attempt-zero convention.

## Failure mapping

`EmailDelivery` maps SMTP outcomes as follows; retryable failures are bounded by the retry budget
(five attempts with the default delays), then the message fails terminally.

| Outcome | When | Detail code |
|---|---|---|
| Sent | SMTP accepted the message, including a `MailSendException` with an empty failed-message map (a `transport.close()` failure *after* acceptance; retrying would duplicate the email) | — |
| RetryableFailure | Per-message send failures and connection failures (`MailSendException` with a populated failed-message map) | `SMTP_DELIVERY_FAILED` |
| RetryableFailure | `MailAuthenticationException`: rotated/expired credentials or a transient auth outage is an operational condition, not a content defect | `SMTP_AUTHENTICATION_FAILED` |
| Rejected | Content defects: validation failures (`INVALID_REQUEST`), unparseable or unpreparable messages (`INVALID_MESSAGE`) | see left |
| RetryableFailure | Anything unexpected | `DELIVERY_FAILED` |

This mapping is coupled to `JavaMailSenderImpl` (Spring Framework 7): its only empty-map
`MailSendException` is the post-accept close failure, and connection failures register the message
in the failed-message map before throwing. Do not invert these branches without re-reading
`JavaMailSenderImpl.doSend`.

## API

All endpoints require `Authorization: Bearer <MESSAGING_INTERNAL_AUTHORIZATION_TOKEN>`.

- `GET /message?status=failed&page=0&size=50`: Spring Data `PagedModel` with `content` and `page`.
  Status is optional and case-insensitive. An unknown status value yields an empty page by design —
  it is not an error and does not return 400, unlike an unknown sort property, which returns 400.
  Spring resolves pagination and sorting, with size capped at 100 by configuration.
- `GET /message/{id}`: `{message, attempts}`, including ordered outcomes and their details.

There is no separate attempts endpoint. List responses carry `sender` and `lockedAt` so operators
can see the From actually used and debug leases, but omit attempt collections, avoiding unnecessary
history loading for every row. Detail uses two bounded query shapes: one message and its history.
API docs are at `/docs`.

## Producer contract

```sql
INSERT INTO queue.message
    (id, site, type, sender, recipient, subject, text, html)
VALUES
    (:id, :site, 'email', :sender, :recipient, :subject, :text, :html)
ON CONFLICT (id) DO NOTHING;
```

Bind parameters in the producer's database library, ideally in its business transaction.
Text and HTML are separate alternatives of the same email, so the type does not replace either.
Templates and localization remain producer responsibilities.
Existing legacy web clients/adapters still need migration to this contract.

The service consumes **`type = 'email'` rows only** — the current channel is an allow-list, not a
default. Rows with another `type` (for example a future `sms`) are left untouched in `queue.message`
for a future consumer and are never deleted, claimed or terminally rejected by this service. A claim
whose `type` is not exactly `email` is rejected at delivery with `INVALID_REQUEST`.

Field limits, enforced as request validation and re-checked before every SMTP send
(oversized or malformed content fails with `INVALID_REQUEST` and never reaches SMTP):

| Field | Limit |
|---|---|
| `subject` | ≤ 200 characters, no CR/LF (a line break would smuggle MIME headers) |
| `text` | ≤ 65,536 characters |
| `html` | ≤ 262,144 characters |
| `site`, `sender`, `recipient`, `replyTo` | non-blank; addresses must be valid emails |

There is no HTTP write endpoint in this service; the request record
(`data/requests/MessageCreateRequest`) is the shared contract and yields 400 under Jakarta
validation for any request boundary that adopts it. The queue table remains the intake, and the
delivery-time re-validation is the authoritative gate.

## Build and configuration

Use Java 25 and build from services with `mvn -pl messaging -am package`. Run the tests with
`mvn test` (the reactor carries unit suites for all services, including this module's domain,
intake, delivery and worker tests). Database and SMTP settings are in application.yaml.
The worker always runs with the service; its two loops — intake and delivery — have independent
poll delays (`messaging.worker.accept-poll-delay-ms` / `deliver-poll-delay-ms`) and run on an
explicit two-thread scheduler, so a full delivery batch cannot starve intake.
The only remaining service outside intake/processing/delivery is the read-only HTTP history API.

SMTP TLS flags (both default to `false` so dev keeps working against mailpit):

- `MESSAGING_SMTP_TLS` → `mail.smtp.starttls.enable`: opportunistic STARTTLS. The session is
  upgraded when the server advertises STARTTLS and **silently continues in plaintext otherwise**,
  including AUTH credentials. `MESSAGING_SMTP_TLS=true` alone is therefore not a TLS guarantee.
- `MESSAGING_SMTP_TLS_REQUIRED` → `mail.smtp.starttls.required`: required STARTTLS. The
  connection fails unless the session is upgraded; there is no plaintext fallback.

Set both to `true` in production. Note for the ops follow-up (out of scope here):
`infrastructure/.env.prod`, `.env.dev` and the compose `environment` sections must forward the new
`MESSAGING_SMTP_TLS_REQUIRED` variable next to `MESSAGING_SMTP_TLS`.
