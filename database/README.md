# Database

During development, recreate an empty database and apply V001–V010 in order.
Schema changes are made directly in their owning initial migration; these files are not an
upgrade path for an existing database.

V001 defines schemas, roles and default permissions. V002 defines the producer inbox.
V003 defines identity. V004 defines messaging's delivery state and attempt history.
Every table ends its columns with `created_at` and `updated_at`.

The queue ID is retained as the delivery record's ID after consumption. No foreign key points
back to the removed inbox row, and no separate idempotency key is required.
