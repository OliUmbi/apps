# Database

Flyway migrations are the only schema authority. Files already applied to a
shared environment are immutable.

- `bootstrap/` creates local development login roles when the PostgreSQL volume
  is first initialized. Production roles and passwords are provisioned outside
  the database image.
- `migrations/` contains the ordered handwritten SQL history.
- `schema.sql` is generated from a clean migrated database for review only.
- `schema.ps1` rebuilds that snapshot with the PostgreSQL client in Compose.

Application containers never run migrations and never use the migrator account.
