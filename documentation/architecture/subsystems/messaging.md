# Messaging

The asynchronous email boundary. Producers write a queue row in their own
business transaction; this service consumes it, sends SMTP, and keeps delivery
history. HTTP is read-only for operators.

Full state machine, SMTP mapping and test detail:
[services/messaging/README.md](../../../services/messaging/README.md).

## Responsibility

Turn a durable queue row into an email, once when possible, with an auditable
attempt history and bounded retries. Provider failure must not lose a request
that was already committed.

## Inside

```text
services/messaging/
  domain/       DeliveryState, DeliveryResult, DeliveryStateMachine (no I/O)
  intake/       atomic inbox -> delivery handoff
  processing/   claim, attempt history, worker loop
  delivery/     SMTP adapter and content validation
  controller/   read-only history API
```

The state machine receives explicit time and settings, so it is testable without
Spring or a database. `Message.apply(state)` is the only mutation boundary for
status, lease, count and timestamps.

## Producer contract

The producer inserts into `queue.message` inside the same transaction as its
domain write:

```sql
INSERT INTO queue.message
    (id, site, type, sender, recipient, subject, text, html)
VALUES
    (:id, :site, 'email', :sender, :recipient, :subject, :text, :html);
```

The id is the producer's request UUID. The domain idempotency check prevents a
normal replay from enqueueing again; a duplicate id is a fail-closed unique
violation rather than a silent success, so producers need only INSERT privilege,
never queue reads. Text and HTML are alternatives of the same email. Templates
and localization remain producer responsibilities. Messaging consumes
`type = 'email'` only; other types stay untouched for a future consumer.

## Flow

1. Intake locks one inbox row with `SKIP LOCKED`, inserts a delivery row if its
   `queue_id` is new, and deletes the inbox row in the same transaction.
2. The worker claims a due delivery and starts an attempt. Claim and attempt
   commit together before SMTP.
3. SMTP sends. Completion finishes the attempt and applies the next state in a
   second transaction.
4. A retryable failure schedules `now + retry-delays[n]`; five total attempts by
   default with delays 2, 4, 8 and 16 minutes.
5. A lease expiry is not a failure: the expired attempt is abandoned and the next
   attempt is scheduled with the same backoff, never immediately. The original
   send may still be in flight.
6. A send that is slow past its lease remains ambiguous; recovery can duplicate
   an email. No state machine can undo an external SMTP send.

## States and outcomes

| State | Meaning |
| --- | --- |
| `PENDING` | due or waiting for its retry time |
| `PROCESSING` | claimed under a lease |
| `SENT` | SMTP accepted |
| `FAILED` | rejected or retries exhausted |

Attempt outcomes: `SENT`, `RETRY`, `FAILED`, `ABANDONED`, `REJECTED`. The attempt
history is the sole source of failure detail; `detail` is structured JSON with a
`code` and `message`, never a raw exception or credential.

Failure mapping is coupled to Spring's `JavaMailSenderImpl`: an empty
failed-message map means the transport closed after acceptance (treat as sent);
connection failures and per-message failures are retryable; content defects are
rejected; auth failures are retryable operational conditions.

## API

All endpoints require `Authorization: Bearer <MESSAGING_INTERNAL_AUTHORIZATION_TOKEN>`.

- `GET /message?status=failed&page=&size=` - paged history, optional
  case-insensitive status, size capped at 100. An unknown status yields an empty
  page; an unknown sort property returns 400.
- `GET /message/{id}` - one message plus ordered attempts.

List responses carry `sender` and `lockedAt` but omit attempt collections. Detail
uses two bounded queries.

## Limits

| Field | Limit |
| --- | --- |
| `subject` | 200 characters, no CR/LF (header-injection defense) |
| `text` | 65,536 characters |
| `html` | 262,144 characters |

Limits are request validation and are re-checked before every SMTP send.

## Invariants

1. The queue insert is atomic with the producer's domain write.
2. A producer reuses its request UUID after an uncertain commit.
3. The worst-case send time of one batch stays well below the lease duration;
   lower `worker.batch-size` or raise `worker.lease-duration` if sends are slow.
4. One failing row never stops the batch; it is logged with its full cause chain
   and retried on a later poll.
5. Delivery history is never rewritten to hide a failed attempt.

## Known gaps

- There is no administrator retry endpoint or alert transport yet.
- Campaign sending is not bounded by campaign size; see
  [TD-12](../../work/tech-debt.md#td-12) (R19).
- Queue roles have broader privileges than the producer interface needs; see
  [TD-11](../../work/tech-debt.md#td-11) (R17).
- Campaign delivery results per recipient and retry rules for uncertain sends
  are open product work ([open work](../../work/open-work.md)).
