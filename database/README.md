# Database

PostgreSQL schema for the whole stack. Flyway owns the schema and every
constraint; the Drizzle schemas under `web/packages/*-data` only describe query
types. Timestamps are `timestamptz` (UTC), prices are display-only `text` and exact numerics once
amounts are computed (plan decision D5); quantity columns are exact
`numeric` values that application code reads and writes as decimal strings
(plan decision D2) — `float64` never computes a quantity.

During development, recreate an empty database and apply `migrations/` in
order. Schema changes are made directly in their owning initial migration
(pre-launch sanction); these files are not an upgrade path for an existing
database. The baseline freezes at the first accepted production import. After that,
destructive changes follow expand → backfill → verify → contract, and new
changes are append-only migrations.

V001 defines schemas, roles and default permissions. V002 defines the producer
inbox. V003 defines identity. V004 defines messaging's delivery state and
attempt history. V005 defines assets. V006 defines the studio schema. V007–V009
define the three site schemas (jublawoma, unclet, zelglihof), including nullable
`submission_id` idempotency keys and unique indexes on the five
public-submission tables. V010 adds the append-only `studio.audit_event` history
for destructive and administrative Studio actions; V011 adds the anonymous
`analytics.view_daily` counter; V012 adds the read-only `monitoring` role
(`pg_monitor`) for postgres_exporter. Every table ends its columns with
`created_at` and `updated_at`.

V001 still reserves the `oliumbi` schema and role, but there is no Oliumbi
migration and no table: the first Oliumbi slice is a static site with no
database. The role stays `NOLOGIN` in production.

Delivery records have independent IDs. Their unique queue_id correlates with the
original request and protects against replay. No foreign key points back to the
consumed inbox row.

## Roles and credentials (RS-E1)

The migrations create eight application roles as `NOLOGIN` roles **without
passwords**: `identity`, `messaging`, `assets`, `studio`, `jublawoma`, `unclet`,
`zelglihof` and the reserved `oliumbi`. Credentials are provisioned per
environment after `V001` has run; no password literal lives in this directory.
Seven roles are provisioned in production; `oliumbi` stays `NOLOGIN` because the
static site has no database client. V012 adds a separate read-only `monitoring`
role (`pg_monitor`) for postgres_exporter, provisioned the same way. The first
Studio administrator is likewise
an operational step (`ansible/playbooks/first-admin.yml`), not a migration seed.

- **Development** — the documented entry path is the dev compose stack:
  `docker compose -f infrastructure/compose.dev.yaml up` runs the `flyway`
  service and then the one-shot `roles` service, which issues
  `ALTER ROLE … LOGIN PASSWORD …` for every application role from the
  `*_DATABASE_USER` / `*_DATABASE_PASSWORD` values in `infrastructure/.env.dev`
  (dev-only defaults ship in `compose.dev.yaml`). Applications start only after
  provisioning completes. For a database created without the compose stack, run
  the same statements once by hand after migrating, for example:

  ```sh
  psql -U <migrator> -d apps \
    -v identity_password="$IDENTITY_DATABASE_PASSWORD" \
    -c "ALTER ROLE identity LOGIN PASSWORD :'identity_password';"
  ```

  Repeat for `messaging`, `assets`, `studio`, `oliumbi`, `jublawoma`, `unclet`
  and `zelglihof` with the matching variable. Existing development volumes
  created before this change keep working until their roles are re-provisioned
  once with the same statements.
- **Production** — provisioning is part of the deployment flow, not the
  migrations: the Ansible `app` role runs `ALTER ROLE … LOGIN PASSWORD …` from
  the vault after `apps-migrate` and before the application units start, then
  verifies one connection per role. The seven application roles are provisioned;
  `oliumbi` stays `NOLOGIN`. Rotate any real credential that was ever committed
  to this repository; non-secret placeholders are not credentials.

## Constraint list (RS-E2 / R07, plan decision D3)

CHECK constraints are the backstop behind request validation. The per-workflow
status domains below are the vocabulary to mirror in TypeScript (plan decision
D4); shared spelling is not shared meaning.

| Table | Rule |
| --- | --- |
| `jublawoma.promotion` | `promotion_window`: `starts_at < ends_at` |
| `jublawoma.event` | `event_period`: `starts_on <= ends_on` (a single-day event is one row) |
| `jublawoma.donation` | `donation_window`: `starts_at < ends_at` |
| `jublawoma.donation_item` | `donation_item_quantity_positive`: `quantity > 0`; `donation_item_step_positive`: `step > 0` |
| `jublawoma.donation_commitment` | `donation_commitment_item_quantity_positive`: `item_quantity > 0`; `donation_commitment_step_positive`: `step > 0`; `donation_commitment_quantity_positive`: `quantity > 0` |
| `unclet.review` | `review_stars_range`: `stars BETWEEN 1 AND 5` |
| `unclet.inquiry` | `inquiry_status_domain`: see vocabulary |
| `zelglihof.promotion` | `promotion_window`: `starts_at < ends_at` |
| `zelglihof.product` | `product_window`: `starts_at < ends_at` where both ends of the window are set; `archived_at`/`archived_by` retire the row without deleting it |
| `zelglihof.product_variant` | `product_variant_quantity_nonnegative`: `quantity IS NULL OR quantity >= 0` (NULL = unlimited stock, 0 = sold out); `archived_at`/`archived_by` retire the row without deleting it |
| `zelglihof.product_reservation` | `product_reservation_status_domain`: see vocabulary; `product_reservation_quantity_positive`: `quantity > 0`; `product_reservation_variant_quantity_nonnegative`: `variant_quantity IS NULL OR variant_quantity >= 0`; `product_reservation_cancelled_metadata`: cancellation columns only on `cancelled`; `product_reservation_stock_restored_cancelled`: `stock_restored` only on `cancelled` |
| `zelglihof.subscriber` | `subscriber_status_domain`: see vocabulary |
| `zelglihof.campaign` | `campaign_status_domain`: see vocabulary |
| `zelglihof.inquiry` | `inquiry_status_domain`: see vocabulary; `inquiry_subject_domain`: `subject IN ('hofladen', 'reservation', 'hof', 'other')` |
| `messaging.message` | lifecycle CHECK: each status requires its own `available_at`/`locked_at`/`finished_at`/`attempt_count` combination |
| `messaging.message_attempt` | lifecycle CHECK: open attempts carry no result; finished attempts carry an outcome and its detail |

Importing legacy data must validate against these rules. Known friction:
imported inquiries need a category (`subject` is `NOT NULL`) — map uncategorized
legacy contacts to `'other'`; imported donation items, commitments and
reservations must carry positive quantities and steps.

The 500-recipient campaign bound is application-level, not a CHECK: the data
package counts confirmed recipients and refuses an over-limit send before
queuing anything or changing the campaign status. A refusal leaves the draft
exactly as it was.

## Lifecycle and archive

- **Archive is not a status.** Products and product variants are retired by
  setting `archived_at` and `archived_by`; there is no `archived` value in any
  status domain. Public reads hide archived rows, while reservation history keeps
  its parent reference and snapshots.
- **Cancellation is one-way.** A product reservation may move from `new` or
  `in-progress` to `cancelled`; `cancelled_at`, `cancelled_by`,
  `cancellation_reason` and `stock_restored` record the transition. Stock is
  restored exactly once when a tracked variant still exists; a missing or
  unlimited variant cancels without a stock change and records that fact. The
  generic status editor never writes cancellation.
- **Queued campaigns are irreversible.** Only draft campaigns can be edited or
  deleted. Once queued, there is no cancellation contract for the queued mail.

## Per-workflow status vocabulary

| Workflow | Table | States |
| --- | --- | --- |
| Inquiry (zelglihof contact) | `zelglihof.inquiry` | `new`, `in-progress`, `completed`, `cancelled` |
| Inquiry (unclet event request) | `unclet.inquiry` | `new`, `in-progress`, `completed`, `cancelled` |
| Product reservation | `zelglihof.product_reservation` | `new`, `in-progress`, `completed`, `cancelled` |
| Newsletter subscriber | `zelglihof.subscriber` | `pending`, `active`, `unsubscribed` |
| Newsletter campaign | `zelglihof.campaign` | `draft`, `queued` |
| Review moderation | `unclet.review` | no status column; `visible` false = pending moderation, true = published |
| Message delivery | `messaging.message` | `PENDING`, `PROCESSING`, `SENT`, `FAILED` |
| Message attempt outcome | `messaging.message_attempt` | `SENT`, `RETRY`, `FAILED`, `ABANDONED`, `REJECTED` |

Archive is deliberately absent from this table: it is a lifecycle column
(`archived_at`/`archived_by`), not a state. `cancelled` is reachable only through
the explicit one-way cancellation transition described above.

## Orphaned business records

`donation_commitment` and `product_reservation` reference their parent with
`ON DELETE SET NULL` and keep customer and stock snapshots
(`donation_title`, `item_name`, `product_name`, `variant_*`). Deleting a parent
must not make its business records vanish: admin lists include orphaned rows and
Studio marks them where parent context is shown. The unique nullable
`submission_id` in each public-submission table is the public-form idempotency
key and must stay unique.
