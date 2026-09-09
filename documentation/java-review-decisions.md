# TODO review decisions

## Identity

- New accounts start enabled; creation no longer takes an enabled field. Update still does.
- Account detail returns `{account, permissions}`. Permissions are records, loaded through a
  one-to-many entity graph for detail only. The standalone permission GET is removed; grant and
  revoke remain. The previous long repository name described nested properties and ordering,
  not an inherently expensive operation; the association better matches the intended detail view.
- The account-row lock serializes permission grants/revokes and account deletion. Without it,
  simultaneous check-then-insert grants can race on the composite primary key. Retained.
- Permission normalization moved to NormalizeService. Request annotations protect HTTP entry;
  a small defensive guard also protects service calls outside HTTP.
- BCrypt's 72-byte input limit is an encoder limitation, not a character policy. It is now a named
  constant and the guard has an explicit BCrypt name. Longer passwords require choosing another
  encoder, e.g. Argon2id, and planning a versioned-hash migration rather than raising the constant.
- Unique token_hash already has PostgreSQL's unique index. No duplicate index was added.
- Account pagination remains deferred as requested.
- Permission catalog remains open until the web permission model is clearer. Start with an explicit
  checked-in catalog of keys/descriptions owned by identity or the consuming features; do not infer
  the catalog from existing grants, which would miss unused permissions and perpetuate typos.
  Keep assignment storage independent of that future catalog.

## Messaging

The previous services split individual steps without establishing an owner for state. They are
replaced by a pure, exhaustive state machine and a transactional adapter. See services/messaging/README.md
for the full transition table and the three genuine crash boundaries: intake, SMTP, completion.

Delivery IDs are independent. queue_id is a unique correlation reference without a foreign key
because inbox rows are removed. It also makes replay behavior explicit.

Failures are stored only in attempt.detail as structured JSON. Keeping a code alongside a safe
description preserves both programmatic handling and readable diagnostics without duplicating
columns on message. Invalid content is rejected through the ordinary first attempt.

Text and HTML stay separate: both may be sent as alternatives in one email. A generic body would
need a richer typed payload, not simply a renamed string. Defer that until another channel exists.

Only worker lookup indexes are retained beyond mandatory unique/primary-key indexes; the speculative
history index is removed. Additional indexes should follow actual queries and measurements.

Message detail includes attempts; list uses Spring Data's stable PagedModel representation and
configurable paging limits. Unknown status filters return an empty page rather than a client error.
Spring discourages relying on PageImpl's raw serialization contract.
[Spring Data PagedModel](https://docs.spring.io/spring-data/commons/reference/api/java/org/springframework/data/web/PagedModel.html)

## Errors and shared code

All controllers retain Spring's standard validation/HTTP exception handling. Database constraint
and concurrency failures receive 409, transient storage failures 503, unexpected exceptions 500.
The handler no longer inspects a PostgreSQL-specific SQLSTATE string. This intentionally gives
generic constraint feedback; domain services still provide clearer messages for expected cases.

Errors include an errorId correlated with logs containing exception class and stack locations.
Raw exception messages, SQL parameters, bodies and tokens are excluded. This improves debugging
without serializing sensitive exception data into responses or logs.

The services reactor now provides shared token verification, HTTP error handling and clock/OpenAPI configuration. See java-shared-library.md for the implemented boundaries and build workflow.

The studio event column remains unchanged: it describes the event key adequately, and renaming
it provides little benefit before the consumer interface is settled.
