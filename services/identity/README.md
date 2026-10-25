# Identity

The service uses constructor injection, Spring Data repository interfaces, Lombok entities,
record DTOs and separate controllers, services and configuration classes.

All endpoints require `Authorization: Bearer <IDENTITY_INTERNAL_AUTHORIZATION_TOKEN>`.
The token is a trusted internal management credential. It must stay on the server.
API documentation is available at `/docs` when the `dev` Spring profile is active; outside
that profile the documentation endpoints are disabled.
`/actuator/health` stays reachable without authentication for the compose health checks.

## Accounts

- `GET /account`: list accounts, paged like messaging and assets (`page`, `size`; default
  size 50, maximum 100, ordered by `createdAt`). The response is the standard page
  envelope `{"content": [...], "page": {...}}`.
- `GET /account/{id}`: read `{account, permissions}`, with permission records.
- `POST /account`: create an enabled account with `name`, `email` and `password`.
- `PUT /account/{id}`: replace `name`, `email` and `enabled`.
- `PUT /account/{id}/password`: change the password with `{"password":"..."}`.
- `DELETE /account/{id}`: delete the account and its sessions and permissions.

Create the initial account through the authenticated account endpoint; no hardcoded bootstrap
password is installed. Names and emails are trimmed and lowercased. Request fields are bounded:
name and permission at 255 characters, email at 320 characters (applied before trimming);
oversized input returns 400 with field-level validation detail. Passwords are encoded using
the configured BCrypt encoder and limited to 72 UTF-8 bytes. New passwords must contain at least
10 Unicode characters, an uppercase letter, a lowercase letter and a digit. The `@ValidPassword`
annotation and `PasswordService` share the same policy. Login checks the stored hash without
reapplying new-password rules, so future policy changes do not silently lock out existing accounts.
Both login failure paths — unknown account and wrong password — perform one BCrypt comparison
(the unknown-account path compares against a fixed dummy hash) and return the same bare 401, so
response time and response shape do not reveal whether an account exists.
Responses never include password hashes.
Password changes and disabling an account revoke its sessions, including after re-enabling it.
The service operation is named `changePassword`; the HTTP path remains `/{id}/password`.
Missing accounts return 404; duplicate names or emails return 409.

## Permissions

The current schema models authorization as permission strings on accounts, without a separate
role catalog or role-to-permission groups. Role-like permissions such as `studio.admin` can be
managed through the dedicated `PermissionController` and `PermissionService`.

- `PUT /account/{accountId}/permission`: grant with `{"permission":"studio.admin"}`.
- `DELETE /account/{accountId}/permission`: revoke with the same body.

Read permissions through account detail. Grant and revoke are idempotent: granting an existing
permission succeeds (the insert uses `ON CONFLICT DO NOTHING`, so concurrent grants cannot race
the primary key into a conflict) and revoking a missing permission succeeds. Permission strings
are trimmed and case-sensitive. Oversized permission strings return 400 with field-level detail
instead of failing at the index.
Existing session endpoints and response contracts remain available.

## Locking and responsibilities

Account updates, password changes, deletion and permission changes acquire a pessimistic write
lock on that account row. The lock lasts until the surrounding transaction commits or rolls back.
Concurrent writes to the same account wait; other accounts and ordinary reads are unaffected.
Login takes the same lock before checking the password and creating a session. This prevents
an old-password login from creating a session after a concurrent password change revokes sessions.
Without that shared lock, revocation alone leaves a race. Locks are held during BCrypt work,
so simultaneous operations on one account serialize; no database-wide lock is taken.

`PasswordService` owns BCrypt validation and encoding. `IdentityInputNormalizer` owns name, email
and permission normalization. Session validity is checked in `SessionService`; `findValidSession`
fetches the session and its account with one `JOIN FETCH` query (the `@EntityGraph` belongs to
`findDetailedById` on accounts). Repository lookups use derived methods; bulk revocation remains an explicit
update query to avoid loading and saving every session.

Session lifecycle: revoking a token is idempotent — an unknown, expired or already-revoked token
is a no-op and still returns 204, so a retried sign-out after a timeout succeeds. `lastSeenAt`
writes are throttled to one update per five minutes per session. A scheduled purge runs hourly
(scheduling enabled with `@EnableScheduling` on `IdentityApplication`, mirroring how messaging
wires its workers) and deletes sessions once they are past `expires_at` plus a 30-day retention
window (`identity.session-retention-days`; run interval `identity.session-purge-delay-ms`). Live
and recently expired sessions are untouched.

Session requests now have validation annotations and live in `data.requests`; response DTOs
live in `data.responses`.

Every entity keeps `createdAt` and `updatedAt` last and uses Hibernate's creation/update timestamp
annotations. Bulk session revocation explicitly updates `updatedAt`, since bulk updates bypass
entity lifecycle callbacks.

## Errors and build

Services explicitly raise expected HTTP failures such as 401, 404 and 409.
`ApiExceptionHandler` applies to all controllers, using Spring's problem responses for request
validation and HTTP errors. Constraint/concurrency conflicts return 409, transient storage errors
503, and unexpected failures 500. Every error response carries a correlation ID in its `errorId`
property, and request-validation failures additionally carry per-field `errors`; logs include
that ID, the exception class, the class-name cause chain and stack locations without raw exception
messages or SQL parameters. A missing or invalid `Authorization` header yields 401 (not 400), and
the two 401s on session endpoints are distinguishable by their `detail`: "Missing or invalid
internal bearer token" means the integration credential is broken, while "Session token is
expired, revoked or unknown" means the caller should sign in again. Login failures deliberately
stay a bare 401. Service-local catches
alone cannot reliably handle transaction-commit failures.

## Build and tests

Use Java 25 and build from services with `mvn -pl identity -am package`. The test suites cover
input normalization, passwords (including the login timing equalizer), tokens and sessions
(lifecycle, throttle, purge), permission granting (idempotency and the constraint-violation path),
and the controller/error contract (auth 401s, pagination, validation detail, error envelope).

