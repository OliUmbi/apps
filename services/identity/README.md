# Identity

The service uses constructor injection, Spring Data repository interfaces, Lombok entities,
record DTOs and separate controllers, services and configuration classes.

All endpoints require `Authorization: Bearer <IDENTITY_INTERNAL_AUTHORIZATION_TOKEN>`.
The token is a trusted internal management credential. It must stay on the server.
API documentation is available at `/docs`.

## Accounts

- `GET /account`: list accounts.
- `GET /account/{id}`: read `{account, permissions}`, with permission records.
- `POST /account`: create an enabled account with `name`, `email` and `password`.
- `PUT /account/{id}`: replace `name`, `email` and `enabled`.
- `PUT /account/{id}/password`: change the password with `{"password":"..."}`.
- `DELETE /account/{id}`: delete the account and its sessions and permissions.

Create the initial account through the authenticated account endpoint; no hardcoded bootstrap
password is installed. Names and emails are trimmed and lowercased. Passwords are encoded using
the configured BCrypt encoder and limited to 72 UTF-8 bytes. New passwords must contain at least
10 Unicode characters, an uppercase letter, a lowercase letter and a digit. The `@ValidPassword`
annotation and `PasswordService` share the same policy. Login checks the stored hash without
reapplying new-password rules, so future policy changes do not silently lock out existing accounts.
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

Read permissions through account detail. Grant and revoke are idempotent. Permission strings are trimmed and case-sensitive.
Existing session endpoints and response contracts remain available.

## Locking and responsibilities

Account updates, password changes, deletion and permission changes acquire a pessimistic write
lock on that account row. The lock lasts until the surrounding transaction commits or rolls back.
Concurrent writes to the same account wait; other accounts and ordinary reads are unaffected.
Login takes the same lock before checking the password and creating a session. This prevents
an old-password login from creating a session after a concurrent password change revokes sessions.
Without that shared lock, revocation alone leaves a race. Locks are held during BCrypt work,
so simultaneous operations on one account serialize; no database-wide lock is taken.

`PasswordService` owns BCrypt validation and encoding. `NormalizeService` owns name/email
normalization. Session validity is checked in `SessionService`, with its account fetched by an
entity graph. Repository lookups use derived methods; bulk revocation remains an explicit
update query to avoid loading and saving every session.

Session requests now have validation annotations and live in `data.requests`; response DTOs
live in `data.responses`.

Every entity keeps `createdAt` and `updatedAt` last and uses Hibernate's creation/update timestamp
annotations. Bulk session revocation explicitly updates `updatedAt`, since bulk updates bypass
entity lifecycle callbacks.

## Errors and build

Services explicitly raise expected HTTP failures such as 401, 404 and 409.
`ApiExceptionHandler` applies to all controllers, using Spring's problem responses for request
validation and HTTP errors. Constraint/concurrency conflicts return 409, transient storage errors
503, and unexpected failures 500. Errors include a correlation ID; logs include that ID, exception
class and stack locations without raw exception messages or SQL parameters. Service-local catches
alone cannot reliably handle transaction-commit failures.

Use Java 25 and build from services with `mvn -pl identity -am package`. Automated tests are intentionally deferred.

