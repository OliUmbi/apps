# Data and schema

One PostgreSQL 18 server, one database, one schema and role per capability.
Flyway owns the schema, constraints and roles. Drizzle describes query types and
never migrates.

The complete constraint and status tables live in
[database/README.md](../../../database/README.md). This page is the architecture
view: what is owned, how a change moves, and which rules always hold.

## Ownership map

| Schema | Owner | Written by | Read by |
| --- | --- | --- | --- |
| `identity` | identity service | identity role | identity service only |
| `messaging` | messaging service | messaging role | messaging service only |
| `assets` | assets service | assets role | assets service only |
| `queue` | producer contract, consumed by messaging | every producer role (insert only), messaging | messaging consumes; producers have no queue read access |
| `studio` | Studio | studio role | studio role |
| `jublawoma` | Jublawoma | jublawoma role + studio role | jublawoma, studio |
| `unclet` | Uncle-T | unclet role + studio role | unclet, studio |
| `zelglihof` | Zelglihof | zelglihof role + studio role | zelglihof, studio |
| `oliumbi` | reserved for the future full site; `NOLOGIN` in production | - (static site; no tables) | - |

Studio's role does not read identity, assets or messaging tables directly; it
uses their HTTP contracts. A site never reads another site's schema.

## Migration map

| Migration | Defines |
| --- | --- |
| `V001__schemas.sql` | schemas, `NOLOGIN` roles, schema privileges, `public` lockdown |
| `V002__queue.sql` | producer inbox consumed by messaging |
| `V003__identity.sql` | accounts, sessions, permissions |
| `V004__messaging.sql` | delivery state and attempt history |
| `V005__assets.sql` | asset metadata and variants |
| `V006__studio.sql` | Studio-owned records, including the append-only audit history |
| `V008__jublawoma.sql` | club events, stories, members, promotions, donations and submission idempotency |
| `V009__unclet.sql` | showcases, reviews, inquiries and submission idempotency |
| `V010__zelglihof.sql` | articles, products, reservations, inquiries, newsletter and submission idempotency |
| `V011__analytics.sql` | anonymous daily page-view counters |
| `V012__monitoring_role.sql` | read-only `monitoring` role for postgres_exporter |

V007 is reserved for the first Oliumbi table set; the schema and role already
exist, so the migration slots in there when the site needs one.

The old empty Oliumbi migration is gone. The `oliumbi` schema and role remain
reserved in V001, but no tables are created and production leaves the role
`NOLOGIN`: the first Oliumbi slice is static and needs no database.

Every table ends with `created_at` and `updated_at`. Delivery records have
independent ids; their unique `queue_id` preserves replay protection without a
foreign key to a consumed inbox row.

Lifecycle in the current schema: `zelglihof.product` and
`zelglihof.product_variant` carry `archived_at` and `archived_by` instead of a
delete path. `zelglihof.product_reservation` carries `cancelled_at`,
`cancelled_by`, `cancellation_reason` and `stock_restored`; cancellation is a
one-way transition from open work. A newsletter campaign has a 500-recipient
bound, checked before anything is queued or the status changes.

## Migration lifecycle

**Before the baseline freeze.** Migration files are edited in place and the
local database is recreated from scratch. There is no upgrade path for an
existing database, and no migration may contain a password literal or seed data
that production must not have. The baseline freezes at the first accepted
production import.

**Once live data exists.** Destructive changes follow expand → backfill → verify
→ contract. Migrations run as a one-shot `apps-migrate` unit before the
application units on every deploy, so no two migrators race. Rollback deploys the
previous application tag; down-migrations are never the default recovery.

**Ownership.** A migration belongs to the unit that owns its model. A change to
another owner's table goes through that owner's contract, not a direct write.

## Rules that always hold

- `timestamptz` in UTC; format for the browser at the edge.
- Archive is a lifecycle column, not a status. A product, variant or other
  managed record is retired by setting `archived_at`/`archived_by`; it is not a
  status value and the public read hides it.
- Cancellation is a one-way status transition with its own audit columns and,
  where stock was reserved, exactly one stock restoration. It is never a generic
  status edit.
- Quantities are exact `numeric`, read and written as decimal strings; `float64`
  never touches a quantity. Arithmetic uses BigInt-scaled integers or SQL
  `numeric`/`SUM`.
- Prices are display-only `text` while no amount is computed. Once an amount is
  computed it becomes an exact numeric. No schema change until the owner agrees
  on display wording.
- CHECK constraints are the backstop behind request validation: per-workflow
  status domains, star ranges, positive quantities and steps, non-negative
  stock, valid date ranges.
- Constraints and deletion behavior are part of the domain model, not cleanup.
- Seed data stays outside production migrations.
- The migrator role is never used by an application.

## Roles and credentials

Migrations create eight roles `NOLOGIN` without passwords. Credentials are
provisioned per environment:

- **development** - the compose stack runs migrations, then a one-shot `roles`
  service that issues `ALTER ROLE ... LOGIN PASSWORD ...` from
  `infrastructure/.env.dev`;
- **production** - the Ansible `app` role provisions login credentials from the
  vault after `apps-migrate` and before the application units start, then verifies
  one connection per role. Only the seven roles that serve an application are
  provisioned; `oliumbi` stays `NOLOGIN` because the site is static.

Any credential ever committed to the repository must be rotated. See
[database/README.md](../../../database/README.md) for the exact role list.

## Invariants

1. One capability writes its schema; everyone else uses a contract or a
   reviewed view.
2. The schema is the source of truth; Drizzle types follow it.
3. A migration runs before the code that needs it.
4. A rollback never requires a down-migration.
5. Constraints reject invalid rows even if a caller skips validation.

## Known gaps

- Schema and migration ownership follow the ratified O-010 direction: Flyway in
  `database/migrations`, one schema per capability, edited in place until the
  baseline freezes at the first accepted import.
- Legacy-import validation against the new constraints is incomplete: imported
  inquiry subjects must map to `other`, and zero-quantity legacy rows are
  rejected. See [TD-14](../../work/tech-debt.md#td-14).
- Production role provisioning is code complete but not yet verified on a clean
  host; verify one connection per provisioned role after the first deploy.
- A PostgreSQL major-version upgrade path is not yet documented
  ([TD-04](../../work/tech-debt.md#td-04)).
