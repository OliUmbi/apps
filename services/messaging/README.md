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
`services/delivery/SmtpEmailDelivery` validates annotated content and translates SMTP results into
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
| Processing | Lease expired, budget available | Processing with next attempt | Abandon previous; start next |
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

All delivery failures, including content validation, follow the same attempt lifecycle.
Attempt history is the sole source of failure details: `detail` is structured JSON containing
`code` and `message`, never raw exceptions or credentials. Message rows do not duplicate it.
A rejected message has a normal rejected first attempt; there is no attempt-zero convention.

## API

All endpoints require `Authorization: Bearer <MESSAGING_INTERNAL_AUTHORIZATION_TOKEN>`.

- `GET /message?status=failed&page=0&size=50`: Spring Data `PagedModel` with `content` and `page`.
  Status is optional and case-insensitive; unknown values return an empty page.
  Spring resolves pagination and sorting, with size capped at 100 by configuration.
- `GET /message/{id}`: `{message, attempts}`, including ordered outcomes and their details.

There is no separate attempts endpoint. List responses omit attempt collections, avoiding unnecessary
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

## Build and configuration

Use Java 25 and build from services with `mvn -pl messaging -am package`. Permanent tests remain deferred.
Database and SMTP settings are in application.yaml; set `messaging.worker-enabled=false` to stop scheduling.
The only remaining services outside intake/processing/delivery are HTTP history and internal authorization.
