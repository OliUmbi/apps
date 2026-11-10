# Identity

The account, session and permission authority. It is an internal Spring Boot
service on port 8081; only Studio and other services call it. Browser sessions
are created by Studio and validated through identity.

Full endpoint and test detail: [services/identity/README.md](../../../services/identity/README.md).

## Responsibility

Own accounts, password hashes, sessions and permission strings. Nothing else
stores or decides authentication state.

## Inside

```text
services/identity/
  controller/   HTTP contract
  service/      account, password, session and permission rules
  repository/   Spring Data interfaces
  entity/       account, session, permission
  config/       security and scheduling
```

Controllers translate HTTP. Services own locks, transactions and policy.
Repositories own queries. Entities never leave the service boundary as DTOs.

## API

All endpoints require `Authorization: Bearer <IDENTITY_INTERNAL_AUTHORIZATION_TOKEN>`.
The token is a trusted internal management credential and must stay on the
server. `/docs` exists only with the `dev` profile; `/actuator/health` is open
for container health checks.

| Method and path | Purpose |
| --- | --- |
| `GET /account?page=&size=` | paged accounts (default 50, max 100, by `createdAt`) |
| `GET /account/{id}` | account plus permission records |
| `POST /account` | create an enabled account |
| `PUT /account/{id}` | replace `name`, `email`, `enabled` |
| `PUT /account/{id}/profile` | update the account's own `name` and `email` |
| `PUT /account/{id}/password` | change password |
| `DELETE /account/{id}` | delete account, sessions and permissions |
| `PUT /account/{accountId}/permission` | grant a permission (idempotent) |
| `DELETE /account/{accountId}/permission` | revoke a permission (idempotent) |

Session endpoints are used by Studio for sign-in, validation, sign-out and
revocation. Their two 401 details are deliberately distinguishable: a broken
integration credential versus an expired, revoked or unknown session token.

## Authentication model

The account model is O-006, ratified: local password accounts for fewer than ten
users, no external provider. The short threat model is in
[decisions](../../reference/decisions.md#o-006-threat-model-accepted-2026-11).
Recovery, invitations and MFA stay out of scope until public accounts exist.

- **Internal callers** authenticate with a shared bearer token from the
  environment. There is no public identity API.
- **Passwords** are BCrypt hashes, limited to 72 UTF-8 bytes. New passwords need
  at least 10 Unicode characters, an uppercase letter, a lowercase letter and a
  digit. Login checks the stored hash without re-applying new-password rules, so
  policy changes do not lock out existing accounts.
- **Unknown account and wrong password** both perform one BCrypt comparison
  (against a fixed dummy hash for the unknown case) and return the same bare 401,
  so response shape and timing do not reveal whether an account exists.
- **Permissions** are strings on accounts (`studio.admin`, `<site>.manage`, ...).
  There is no separate role catalog yet. Grant and revoke are idempotent.
- **Sessions** are random 256-bit tokens, valid for seven days. Identity stores
  only their SHA-256 hashes and revokes them server-side on password change or
  account disable. Revoking is idempotent; an unknown, expired or already-revoked
  token still returns 204. `lastSeenAt` writes are throttled to one per five
  minutes. An hourly purge deletes sessions past `expires_at` plus a 30-day
  retention window.
- **Login abuse** is bounded by a login-specific rate limit at the edge: 10
  requests per minute per client IP on Studio's `/api/session/login` route. The
  route exists so the proxy can target that exact path.

## Locking and consistency

Account updates, password changes, deletion and permission changes acquire a
pessimistic write lock on that account row for the transaction. Login takes the
same lock before checking the password and creating a session, so an old-password
login cannot create a session after a concurrent password change has revoked
sessions. Locks are per account; there is no database-wide lock.

## Errors

Every error is a Spring problem response with `errorId`, a per-request
correlation id also written to the log. Validation failures add a per-field
`errors` list. Missing accounts return 404, duplicate names or emails 409,
constraint/concurrency conflicts 409, transient storage errors 503, unexpected
failures 500. Logs keep the cause chain and correlation id but never raw SQL
parameters or credentials.

## Data

Schema `identity`: accounts, sessions, permissions. Accounts are created without
a hardcoded bootstrap password. The first administrator is a one-time
operational step: `ansible/playbooks/first-admin.yml` creates the account through
the authenticated internal API and grants `studio.admin`. It is deliberately not
a migration seed, so no password enters schema or seed data. The schema and
constraints are owned by Flyway; see [data and schema](data-and-schema.md) and
[database/README.md](../../../database/README.md).

## Invariants

1. Password hashes and session tokens never appear in responses or logs.
2. Every account mutation is serialized by the account row lock.
3. A password change or disable revokes all sessions.
4. Authorization decisions belong to the caller; identity supplies the facts.
5. Expected failures are typed HTTP problems, not raw exceptions.

## Known gaps

- Recovery, invitations, MFA and public accounts are deliberately out of scope
  until the owner needs them; O-006 is otherwise settled.
- The first-admin playbook and the login rate limit are code complete; verify
  them on the real host after the first clean deploy.
