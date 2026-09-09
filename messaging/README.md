# Messaging

Messaging consumes prepared email requests from the database. HTTP is only for inspecting
delivery history. Controllers, services, JPA repository interfaces, Lombok entities and record
DTOs follow identity's structure.

## Ownership and intake

- `queue.message` is the producer inbox: id, site, type, sender, recipient, subject, text,
  optional HTML and audit timestamps. Producers insert within their business transaction.
- `messaging.message` is the durable delivery record. Messaging owns status, retry count, lease,
  timestamps and the latest failure.
- `messaging.message_attempt` records each delivery attempt and its outcome.

`MessageIntakeService` locks one incoming request with `SKIP LOCKED`, validates its annotated
request DTO and copies it into messaging. Copying and removing the inbox row share one transaction.
A crash rolls both back. The delivery record retains the original queue ID; replaying that ID
keeps the first record, including if it failed. There is no separate idempotency key.
There is deliberately no foreign key to the consumed inbox row, because that row is deleted.
Producers should allocate a stable UUID before submitting and reuse it after an uncertain commit.
A new UUID represents a new message, even if its content matches a previous message.

Example producer insert (parameter values must be bound by the producer's database library):

```sql
INSERT INTO queue.message
    (id, site, type, sender, recipient, subject, text, html)
VALUES
    (:id, :site, 'email', :sender, :recipient, :subject, :text, :html)
ON CONFLICT (id) DO NOTHING;
```

Validation occurs after the handoff is read, since SQL producers do not run Jakarta validation.
Invalid requests become failed delivery records with zero attempts; they do not block the inbox.
Templates and localization belong to producers.

## Delivery and failures

- `MessageIntakeService` owns the atomic handoff; `MessageCreationService` selects initial state.
- `MessageClaimService` claims work; `MessageRecoveryService` closes expired claims and applies the limit.
- `MessageAttemptService` records attempt lifecycles within the caller's transaction.
- `MessageDispatchService` calls the injectable `MessageDelivery` interface and classifies failures.
- `MessageCompletionService` applies the result with stale-claim protection.
- `MessageProcessingService` coordinates claim, dispatch and completion; `MessageWorker` only schedules batches.
- `MessageRetryService` owns retry policy; `MessageFailureService` owns safe failure classification.

Entities only assign supplied constructor values. Services choose status, attempt count and due
time. Hibernate manages `createdAt` and `updatedAt`, which are the final two fields/columns.
`requestedAt` separately preserves the producer's creation time. The SQL inbox has timestamp defaults
because its producers write SQL rather than using Hibernate.

Delivery happens outside database transactions. Claims expire after five minutes, and abandoned
attempts count toward the limit of five total attempts. Retry delays are 2, 4, 8 and 16 minutes.
Invalid content and SMTP authentication errors stop immediately; other delivery failures retry
within the limit. Failed messages remain available for administrator inspection.

History exposes `failureCode` and `failureMessage`, including `INVALID_REQUEST`,
`SMTP_AUTHENTICATION_FAILED`, `SMTP_DELIVERY_FAILED` and `DELIVERY_TIMEOUT`.
Logs contain message IDs, attempt numbers and safe codes. Raw SMTP/SQL exception messages and
message contents are not exposed. Infrastructure failures leave requests or leases available
for later recovery and are logged.

No alert delivery or administrator retry endpoint is implemented yet. After addressing the cause,
an administrator can deliberately submit a new request with a new ID, retaining
the original failure history. Duplicate delivery remains possible when SMTP succeeds before a
process/database failure; attempt fencing protects database state, not the external SMTP operation.

## Read-only API

All endpoints require `Authorization: Bearer <MESSAGING_INTERNAL_AUTHORIZATION_TOKEN>`.
Documentation is available at `/docs`.

- `GET /message?status=failed&page=0&size=50`: paginated history; status is optional, size is 1–100.
- `GET /message/{id}`: current delivery status and safe failure details.
- `GET /message/{id}/attempt`: ordered attempt history.

There are no create or retry HTTP endpoints. An unread producer request is not yet present in
delivery history. `ApiExceptionHandler` produces consistent problem responses across controllers.

## Configuration and migration

Use `DATABASE_URL=postgresql://host:5432/database`, `MESSAGING_DATABASE_USER`,
`MESSAGING_DATABASE_PASSWORD`, `MESSAGING_INTERNAL_AUTHORIZATION_TOKEN` and the SMTP
settings in `application.yaml`. Set `messaging.worker-enabled=false` to disable both workers.
Each worker polls every second and handles at most 20 items per run.

The initial schema files define the final structure directly: V001 owns schema/role permissions,
V002 owns the producer queue, and V004 owns delivery records and attempts. During development,
recreate an empty database and apply the initial migrations; no upgrade or data-copy migration
is maintained. Producers have insert/select access to the inbox; messaging consumes it.

The existing web messaging client and older web database adapters still need their schema migration.
They cannot use the removed HTTP submission contract.

## Build

Use Java 25 and `mvn -Dmaven.test.skip=true package`. Automated tests are intentionally deferred.
