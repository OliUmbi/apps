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
database.

V001 defines schemas, roles and default permissions. V002 defines the producer
inbox. V003 defines identity. V004 defines messaging's delivery state and
attempt history. V005 defines assets. V006 defines the studio schema. V007 is
reserved for the future Oliumbi site. V008–V010 define the three site schemas
(jublawoma, unclet, zelglihof). V011 adds the nullable `submission_id`
idempotency key with unique indexes to the four public-submission tables. Every
table ends its columns with `created_at` and `updated_at`.

Delivery records have independent IDs. Their unique queue_id correlates with the
original request and protects against replay. No foreign key points back to the
consumed inbox row.

## Roles and credentials (RS-E1)

The migrations create the eight application roles as `NOLOGIN` roles **without
passwords**. Credentials are provisioned per environment after `V001` has run;
no password literal lives in this directory.

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
  migrations: the vault/Ansible deployment runs `ALTER ROLE … LOGIN PASSWORD …`
  for every role from the vault values after `apps-migrate` and before the
  services start (ops follow-up tracked in `open-work.md`: "replace development
  secrets / update roles and credentials"). Rotate any credential that was ever
  committed to this repository.

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
| `zelglihof.product` | `product_window`: `starts_at < ends_at` where both ends of the window are set |
| `zelglihof.product_variant` | `product_variant_quantity_nonnegative`: `quantity IS NULL OR quantity >= 0` (NULL = unlimited stock, 0 = sold out) |
| `zelglihof.product_reservation` | `product_reservation_status_domain`: see vocabulary; `product_reservation_quantity_positive`: `quantity > 0`; `product_reservation_variant_quantity_nonnegative`: `variant_quantity IS NULL OR variant_quantity >= 0` |
| `zelglihof.subscriber` | `subscriber_status_domain`: see vocabulary |
| `zelglihof.campaign` | `campaign_status_domain`: see vocabulary |
| `zelglihof.inquiry` | `inquiry_status_domain`: see vocabulary; `inquiry_subject_domain`: `subject IN ('hofladen', 'reservation', 'hof', 'other')` |
| `messaging.message` | lifecycle CHECK: each status requires its own `available_at`/`locked_at`/`finished_at`/`attempt_count` combination |
| `messaging.message_attempt` | lifecycle CHECK: open attempts carry no result; finished attempts carry an outcome and its detail |

Importing legacy data must validate against these rules. Known friction:
imported inquiries need a category (`subject` is `NOT NULL`) — map uncategorized
legacy contacts to `'other'`; imported donation items, commitments and
reservations must carry positive quantities and steps.

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

## Orphaned business records

`donation_commitment` and `product_reservation` reference their parent with
`ON DELETE SET NULL` and keep customer and stock snapshots
(`donation_title`, `item_name`, `product_name`, `variant_*`). Deleting a parent
must not make its business records vanish: admin lists include orphaned rows and
Studio marks them where parent context is shown. The unique nullable
`submission_id` (V011) is the public-form idempotency key and must stay unique.
