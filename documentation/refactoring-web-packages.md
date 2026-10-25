# Refactoring handoff — web packages

Working document for orchestrating a refactor of `web/packages/*`. Not a maintained
human document; safe to merge with sibling reports and supersede. Produced
2026-10-25 from a full read of all `web/packages/*/src` files, usage tracing across
`web/sites/*` and `web/tests/*`, live runs of the verification commands, and a
cross-check against `documentation/code-quality-review.md` (2026-09-25),
`documentation/open-work.md`, `documentation/architecture.md`,
`documentation/principles.md`, `documentation/decisions.md`, `web/README.md`.

**Reader contract for the orchestrating agent:**

- Findings are `W-01`…`W-29` (prefix `W` = this report; other sessions will have
  their own prefixes). Each finding carries a **dedupe key** pointing at
  `code-quality-review.md` (`Rxx`) or `open-work.md` bullets where the same issue
  is already tracked, or `NEW` when this report is likely the first record.
- Tasks are `T-00`…`T-24`, unique IDs grouped in dependency phases. Each task lists affected files,
  the change, acceptance criteria, and **collision notes** (files shared with other
  tasks — serialize those, do not run them concurrently in separate worktrees).
- Line numbers were spot-verified for `W-01`–`W-04` and `W-09`; the rest come from
  a complete file-by-file audit and are reliable to ±a few lines after refactors.

---

## 1. Scope

**In scope:** `web/packages/*` (14 packages), their consumers in `web/sites/*/src`,
`web/tests/*`, `web/package.json`, `web/pnpm-workspace.yaml`, `web/tsconfig.json`,
`web/biome.json`, `web/sites/*/Dockerfile`, and (where a finding requires it)
`database/migrations/*` and `documentation/*`.

**Out of scope:** `services/**` Java, `legacy/`, `infrastructure/`, `ansible/`,
site visual design, and the Studio WIP feature work itself (see `W-29`).

**Scope caveat:** several findings cross into `web/sites/studio` (the only consumer
of admin CRUD contracts) and into `database/migrations` (Flyway). Tasks that do
this are marked `cross-boundary`. Java-side counterparts (e.g. `R01` profile-field
ownership in `services/identity`) are noted under §7 but not tasked here.

## 2. Baseline — verified state at handoff

| Command (from `web/`) | Result |
| --- | --- |
| `pnpm typecheck` | passes (all packages, sites, tests) |
| `pnpm test` | 15 pass, 1 silently skipped (`tests/studio-repositories.test.ts`, needs `STUDIO_TEST_ADMIN_URL` + PostgreSQL) |
| `pnpm check` | **fails**: 4 Biome format errors, all in uncommitted WIP (`sites/studio/src/components/ui/button.tsx`, `.../text-field.tsx`, `sites/studio/src/gradients.css`, `sites/studio/src/styles.css`). Committed tree is clean |
| CI (`.github/workflows/publish.yml`) | image build/push only; no lint/type/test |

Uncommitted working tree at handoff (do not destroy; finish or park before
refactoring): modified `web/README.md`, `web/packages/environment/src/vite.ts`,
`web/sites/studio/src/components/input-field.tsx`, `login-view.tsx`,
`routes/__root.tsx`, `styles.css`; untracked `web/sites/studio/src/components/ui/`,
`web/sites/studio/src/gradients.css`.

## 3. Architecture snapshot (what exists, who uses it)

14 packages, ~4.5k source lines. Dependency graph (declared and verified):

```
contracts ← database, http-client, assets, ui, {jublawoma,unclet,zelglihof}-data, all sites
http-client ← assets, identity, messaging, sites/studio
database ← queue, {jublawoma,unclet,zelglihof}-data, all sites
queue ← unclet-data, zelglihof-data          (jublawoma-data declares it but never imports it — W-14)
i18n ← ui, all sites
```

| Package | Consumers | Notes |
| --- | --- | --- |
| `contracts` | all sites, studio, 3 data packages, database, http-client, assets, ui, tests | wildcard export; `content-validation` only via deep import |
| `database` | all sites, 3 data packages, queue, tests | wildcard export; role enforcement in `connection.ts` is good |
| `http-client` | assets, identity, messaging, studio, tests | clean; error surface too thin (`W-15`) |
| `assets` | studio (client), all 4 sites (`public-image.server`, `urls`), tests | |
| `identity` | studio only | `updateAccount` carries `enabled` (see `R01`) |
| `messaging` | studio only | read-only history client |
| `queue` | unclet-data, zelglihof-data only | enqueue-in-caller's-transaction design is correct |
| `environment` | 4 × `vite.config.ts` | |
| `i18n` | all sites, ui | generated `src/paraglide` output (`W-25`) |
| `query` | all sites | trivial provider |
| `ui` | all sites, tests | explicit per-file exports (good); form/pagination issues `W-20`, `W-21` |
| `jublawoma-data` (24 files) | jublawoma, studio, tests | |
| `unclet-data` (16 files) | unclet, studio, tests | |
| `zelglihof-data` (38 files) | zelglihof, studio, tests | |

**Usage verdict (the "is it even used" question): no dead packages, no dead
files.** Every `src` file is reachable. Real waste is limited to: dead exports
`documentUrl` (`assets/src/urls.ts`), `Actor` (`identity/src/types.ts`); ~11
internal-only-but-exported symbols (`W-14`); unused dependency `@oliumbi/queue` in
`jublawoma-data`; redundant `"./contracts"` export entries in the 3 data packages.

**Test coverage map:** `tests/shared-web.test.ts` → contracts, http-client, asset
proxy, `ui/responsive-image`. `tests/studio-models.test.ts` → content input schemas
(jubla story, zelglihof campaign/product/reservation/variant/promotion) + studio
`slugify`. `tests/studio-repositories.test.ts` (integration, skipped) → all 21
content repositories + 3 schemas. **Untested:** every service/workflow layer, all
three `public.repository.ts`, `identity`, `messaging`, `queue`, `assets/src/index.ts`,
all ui form components. Tests import via relative deep paths (`../packages/*/src/...`),
so they bypass package `exports` maps.

## 4. Findings register

### A. Public submission workflows (money, stock, queue)

| ID | Sev | Finding | Location | Dedupe |
| --- | --- | --- | --- | --- |
| W-01 | **P1** | Submissions are not idempotent. Every request mints a fresh UUID; a browser retry/double-click creates duplicate rows, decrements stock twice and queues duplicate emails. The customer-visible reference derives from that fresh UUID, so support cannot dedupe either. | `zelglihof-data/src/inquiry.service.ts:16`, `unclet-data/src/inquiry.service.ts:16`, `zelglihof-data/src/reservation.service.ts:17-18`, `jublawoma-data/src/donation.service.ts:26` → `donation.repository.ts:43-44` (DB `defaultRandom`, `schema.ts:99`); stock decrement `reservation.repository.ts:32-45`; reference `queue/src/email.ts:35-37` | R10 + open-work "Prevent duplicate reservations and donation commitments after retries" |
| W-02 | **P1** | Float arithmetic in donation validation. `validIncrement` compares `quantity/step` against `Math.round` with absolute tolerance `1e-8` on the ratio → legitimate large increments rejected; the capacity check sums float64 → `0.1 + 0.2 > 0.3` can tip either way. | `jublawoma-data/src/donation.service.ts:5-12`, `:20-27` | NEW (sharpens R02) |
| W-03 | P2 | SQL `numeric` read as JS `number` (`mode: "number"`), sums force-cast with `mapWith(Number)`; float64 silently rounds money-like quantities. | `jublawoma-data/src/schema.ts:91-92`, `:105-110`; `donation.reader.ts:16-19`; `donation.repository.ts:34-37` | R02 |
| W-04 | P2 | `update()` spreads PK/FK columns into `SET`. A `key`/`values` mismatch silently re-parents or rewrites the primary key (or raises a raw unique violation). Studio validators (`z.strictObject({ key, values })`) do not enforce `key == values` identity. | `jublawoma-data/src/content/story-image.repository.ts:36-52`, `unclet-data/src/content/showcase-image.repository.ts:36-52`, `zelglihof-data/src/content/article-image.repository.ts:36-52`, `jublawoma-data/src/content/donation-item.repository.ts:31-41`, `zelglihof-data/src/content/product-variant.repository.ts:31-41`; studio validators e.g. `sites/studio/src/server/content/jublawoma/story.functions.ts:36` | NEW |
| W-05 | P2 | No optimistic concurrency. `updatedAt` is written on every update but never compared; concurrent admin edits are silent last-write-wins. Studio sends no concurrency token. Error text "Record not found or no longer editable" implies guards that do not exist (only `campaign.repository.ts:57` guards `status = 'draft'`). | all `*/src/content/*.repository.ts` `update()`; `sites/studio/src/components/content/content-form.tsx:37` | R08 |

### B. Schema and database invariants

| ID | Sev | Finding | Location | Dedupe |
| --- | --- | --- | --- | --- |
| W-06 | P2 | No DB CHECK constraints for status, stars (1–5), positive quantities/steps, stock ≥ 0, date ranges. Drizzle `{ enum: statusValues }` is type-level only; columns are plain `text NOT NULL`. Only `V004__messaging.sql` has CHECKs today. | `database/migrations/V008__jublawoma.sql` (quantity/step/commitment), `V009__unclet.sql:29,40`, `V010__zelglihof.sql:53,81,86,90,105,113`; Drizzle `unclet-data/src/schema.ts:54`, `zelglihof-data/src/schema.ts:93,124` | R07 + open-work "Check constraints, indexes and legacy imports before live data"; gated by open decision O-010 |
| W-07 | P2 | `price` / `variant_price` are free `text` validated with `titleSchema` (any string ≤ 240 chars). Contradicts `architecture.md` ("exact numerics for money"); no totals, no consistent formatting. | `zelglihof-data/src/schema.ts:73,87`; `content/product-variant.ts:21` | NEW (R02-adjacent); owner wording decision in open-work ("Agree display-only CHF price wording") |
| W-08 | P2 | Contact form `subject` category is validated but never persisted; the inquiry table has no such column. Studio loses the categorization (it survives only in the notification email text). | `zelglihof-data/src/forms.ts:15`; `inquiry.repository.ts:8-17`; `schema.ts:122-131`; `inquiry.email.ts:13` | NEW |
| W-09 | P2 | Newsletter edge cases: (a) `request()` passes a fresh `unsubscribeToken`, but the `onConflictDoUpdate` set omits it → silently discarded for existing rows; (b) `correctEmail` can hit a raw PG 23505 when the new email belongs to another subscriber and force-resets the status to `pending` regardless of current state. | (a) `zelglihof-data/src/newsletter.subscribe.ts:27` vs `newsletter.repository.ts:61-85`; (b) `subscriber.service.ts:23-41` vs `newsletter.repository.ts:44-57` | NEW |
| W-10 | P2 | Child rows orphaned by `ON DELETE SET NULL` become invisible in admin lists (`listForX` filters on the now-NULL parent column). Policy for orphaned commitments/reservations is undecided. | `jublawoma-data/src/content/donation-commitment.repository.ts:30`, `zelglihof-data/src/content/product-reservation.repository.ts:61`; FKs `V008:91-92`, `V010:69-70` | NEW; relates to open-work "Define reservation cancellation and stock restoration, including deleted variants" |

### C. Package boundaries and naming

| ID | Sev | Finding | Location | Dedupe |
| --- | --- | --- | --- | --- |
| W-11 | P2 | Colliding exported names within packages. Five factory collisions (workflow repo vs `content/` CRUD repo with the same name): `createDonationRepository` (`jublawoma-data/src/donation.repository.ts:7` vs `content/donation.repository.ts:8`), `createInquiryRepository` (`unclet-data/src/inquiry.repository.ts:5` vs `content/inquiry.repository.ts:8`), `createReviewRepository` (`unclet-data/src/review.repository.ts:6` vs `content/review.repository.ts:8`), and the same two in `zelglihof-data`. Four type collisions: `DonationItem`, `InquiryInput`, `ReviewInput`, `Campaign` (hand-written/Pick types vs `$inferSelect` rows). Since repositories take `Database \| Transaction`, a wrong auto-import **compiles silently** and swaps the API surface. | files above + `jublawoma-data/src/donation.types.ts:1` vs `content/donation-item.ts:14`; `unclet-data/src/forms.ts:19,26` vs `content/inquiry.ts:15`, `content/review.ts:19`; `zelglihof-data/src/campaign.types.ts:3` vs `content/campaign.ts:11` | NEW |
| W-12 | P2 | Export surfaces are not deliberate. `"./*": "./src/*.ts"` wildcards expose whole src trees (`contracts`, `database`, `queue`, 3 data packages), making internal renames breaking changes. Redundant explicit `"./contracts"` entries (already covered by the wildcard) in the 3 data packages. `query` maps `./*` to `./src/*.tsx` only (asymmetric — its `.ts` files can't be deep-imported). `ui` is the good counter-example: five explicit subpaths, no index. | `web/packages/{contracts,database,queue,query,jublawoma-data,unclet-data,zelglihof-data}/package.json` | R15 |
| W-13 | P2 | Drizzle row types leak as public DTOs: `export type X = typeof x.$inferSelect` throughout `content/*.ts` (a column rename silently changes site/studio types), and `paginate` returns `T["_"]["result"][number]`. Deliberate narrow types exist but are not applied consistently (`content/subscriber.ts:10-13`, `campaign.types.ts:3-10` are the patterns to extend). | e.g. `jublawoma-data/src/content/story.ts:16`, `zelglihof-data/src/content/product.ts:16`; `database/src/pagination.ts:8` | R15 |
| W-14 | P3 | Dependency/export hygiene: `jublawoma-data/package.json` declares `@oliumbi/queue` but never imports it. Truly dead exports: `documentUrl` (`assets/src/urls.ts`), `Actor` (`identity/src/types.ts`). Internal-only but exported: `escapeHtml`, `validIncrement`, `connectionOptions`, `poolDefaults`, `passwordRequirements`, `environmentValues`, `variantSchema`, `PublicImageSize`, `Database`, `DatabasePoolOptions`, `ResponsiveImageSource`. `contracts/src/index.ts` omits `content-validation`, forcing a deep import from all 3 data packages. | files listed | NEW |

### D. Errors and outcome contracts

| ID | Sev | Finding | Location | Dedupe |
| --- | --- | --- | --- | --- |
| W-15 | P2 | `ServiceError` keeps only service name + status; the Java problem response (error code, error ID, correlation id) is dropped, so callers cannot distinguish "sign in again" from "retry" from "conflict". | `http-client/src/index.ts:30`, `http-client/src/error.ts` | R22 |
| W-16 | P2 | Generic string errors ×35 ("Record was not created" ×16, "Record not found or no longer editable" ×19, "Campaign not found", "Subscriber not found") plus raw `ZodError`/PG errors (23505/23503) leaking to server-function boundaries. Nothing distinguishes missing / forbidden / conflict. | all `*/src/content/*.repository.ts`; `zelglihof-data/src/campaign.service.ts:40,42`; `subscriber.service.ts:19,30`; `jublawoma-data/src/donation.service.ts:16` | NEW (R22-adjacent) |
| W-17 | P2 | Outcome contracts are inconsistent: `donation.service.ts:21,25,27` returns ad-hoc `{outcome:"unavailable"\|"committed"}` where `unavailable` conflates not-found / inactive / oversold / bad-increment; `newsletter.subscribe.ts:20-32` returns `"accepted"` for suppressed requests (indistinguishable from "confirmation sent"). Good patterns exist to generalize: `reservation.types.ts:9-11` (result union), `newsletter.confirm.ts:16-30` (typed literals). | files listed | NEW |
| W-18 | P2 | One shared status lifecycle (`statusValues`: new/in-progress/completed/cancelled) drives both Uncle-T inquiries and Zelglihof reservations; adding a reservation state widens inquiry inputs. Shared spelling treated as shared domain meaning. | `contracts/src/validation.ts:36-40`; `unclet-data/src/content/inquiry.ts:12`; `zelglihof-data/src/content/product-reservation.ts:12` | R14 |

### E. Duplication

| ID | Sev | Finding | Location | Dedupe |
| --- | --- | --- | --- | --- |
| W-19 | P2 | ~1,400 lines of templated CRUD. 10 × Template A (62 lines: list/get/create/update/delete, differ only in table + one `ilike` column), 2 × Template B (65), 3 × Template C (86, composite PK), 2 × byte-identical Template D (46). Cross-package byte-identical files: `jublawoma-data/src/content/promotion.{ts,repository.ts}` ≡ `zelglihof-data/src/content/promotion.{ts,repository.ts}`; `unclet-data/src/content/{inquiry.ts,inquiry.repository.ts}` ≡ `zelglihof-data/src/content/*`. Plus 19 duplicated `newXInput()`/`xInputFromRecord()` pairs and the two error strings copied 16×/19×. **A line-by-line check of every where/join/order against the schemas found no copy-paste bugs** — the template is disciplined, just unparameterized. | `*/src/content/*.repository.ts`, `*/src/content/*.ts` | NEW (partially R13/R15) |

### F. Shared UI and form behavior

| ID | Sev | Finding | Location | Dedupe |
| --- | --- | --- | --- | --- |
| W-20 | P2 | Public form hook loses input typing and error meaning: `numberFields`/`defaults` are arbitrary string keys (a renamed domain field compiles), field paths and failure reasons are discarded, and every invalid submission shows the same generic message (`m.required()` renders "Bitte prüfe deine Angaben."). Same control model repeated across three sites. | `ui/src/use-submission-form.ts:16,40-47,54-60`; studio `profile-password-form.tsx:28` | R20, R21 |
| W-21 | P3 | `PaginatedList` requires a consumer-supplied `shell` CSS class and hardcodes button styling; its interface describes data loading but hides layout requirements. | `ui/src/paginated-list.tsx:12,38-46` | R28 |
| W-22 | P3 | Support reference shown to customers is the first 8 chars of a UUID (~32 bits, uppercased): short, guessable, and it changes per retry (see W-01). | `queue/src/email.ts:33-37` | NEW |

### G. Tooling, tests, docs, hygiene

| ID | Sev | Finding | Location | Dedupe |
| --- | --- | --- | --- | --- |
| W-23 | P2 | Node types describe a newer runtime than the containers: `@types/node ^26` in the catalog, `FROM node:24-*` in every site Dockerfile, no `engines` field anywhere. Type checks can accept APIs the runtime lacks. | `web/pnpm-workspace.yaml` catalog; `web/sites/*/Dockerfile` | R32 |
| W-24 | P3 | Dockerfiles duplicate decisions: `node:24-alpine` (studio) vs `node:24-alpine3.24` (others), differing copy order/paths (`/workspace` vs `/app`), `NODE_ENV=production` only in studio, no explicit non-root user in any web stage (Java stages have one). | `web/sites/*/Dockerfile` | R34 |
| W-25 | P2 | i18n generated output has several writers: every site's Vite plugin writes `packages/i18n/src/paraglide`; serialized root build mitigates but concurrent dev servers can collide; typecheck of a clean checkout requires a build first (`web/README.md:98`). | `web/packages/i18n/vite.ts:7` | R31 |
| W-26 | P2 | No CI for lint/type/test; the PostgreSQL integration test skips silently when `STUDIO_TEST_ADMIN_URL` is absent (green run, no coverage); tests bypass package `exports` via relative imports, so export-map breakage is never caught. | `.github/workflows/publish.yml`; `web/tests/studio-repositories.test.ts`; `web/tests/*.test.ts` imports | open-work "Run lint, type checks and builds in CI" |
| W-27 | P2 | Zero tests for every workflow layer: `donation.service`, `inquiry.service` ×2, `reservation.service`, `newsletter.*` (8 files), `campaign.service`, `subscriber.service`, all `public.repository.ts`; plus `identity`, `messaging`, `queue`, `assets/src/index.ts`, ui form components. The money/stock/queue paths are exactly the untested ones. | files listed | NEW |
| W-28 | P3 | Naming/semantics/strictness sweep: `upcoming` predicate includes running events (`jublawoma-data/src/public.repository.ts:24`, `gte(endsOn, current_date)`) and promotion-window logic is inlined twice (`:53-63` vs `activeDonation` `:20-23`); unclet review submissions bypass the service layer (`unclet-data/src/review.repository.ts:8` called straight from the site) while all sibling flows use services; `review.repository.ts:14-15` uses `sql\`now()\`` where every other write uses ISO strings; public forms mix `z.object`/`z.strictObject` (`zelglihof-data/src/forms.ts:11,19,29` non-strict; `unclet-data/src/forms.ts:10` non-strict vs `:21` strict) and use `""` sentinels (`unclet-data/src/forms.ts:14`); `web/tsconfig.json` lacks `noUncheckedIndexedAccess`, so `const [record] = await db.select()…` is typed non-nullable (`donation.repository.ts:29`, `reservation.repository.ts:30`, `newsletter.repository.ts:13`). | files listed | NEW |
| W-29 | P3 | Working-tree hygiene: uncommitted Studio WIP (new `components/ui/`, `gradients.css`, edits to `login-view.tsx`, `__root.tsx`, `styles.css`, `input-field.tsx`, `packages/environment/src/vite.ts`) fails `pnpm check` with 4 format errors. Transient, but blocks clean verification of any refactor. | see §2 | NEW (transient) |

## 5. Task plan

Work in dependency order. Every task must leave `pnpm check && pnpm typecheck &&
pnpm test` green (see §8). Tasks marked **cross-boundary** touch `web/sites/studio`
or `database/migrations`; those need the corresponding site/migration conventions
(O-010 is still an open decision — see §7).

### Phase 0 — preconditions

| ID | Task | Findings | Files | Acceptance | Collides with |
| --- | --- | --- | --- | --- | --- |
| T-00 | Commit, park or revert the Studio WIP; run `pnpm fix`. Establish a green baseline. | W-29 | `sites/studio/src/components/ui/`, `gradients.css`, `styles.css`, `login-view.tsx`, `__root.tsx`, `input-field.tsx`, `packages/environment/src/vite.ts` | `pnpm check` green on the baseline commit | everything — do first |

### Phase 1 — correctness (serialize T-01…T-04; they share files)

| ID | Task | Findings | Files | Acceptance | Collides with |
| --- | --- | --- | --- | --- | --- |
| T-01 | **Idempotent submissions.** Give each public submission a stable request identity supplied/generated once per form fill, checked inside the existing transaction; on repeat, return the original outcome instead of re-committing. Keep stock decrement and queue insert in the same transaction. Decide and document the identity source (hidden form field token vs. server-side per-session token) and its storage (unique index vs. lookup column) — see §7. | W-01, W-22 | `zelglihof-data/src/{inquiry,reservation}.service.ts`, `unclet-data/src/inquiry.service.ts`, `jublawoma-data/src/donation.{service,repository}.ts`, `queue/src/email.ts`, site form submitters in `web/sites/{jublawoma,unclet,zelglihof}/src/data/`, likely `database/migrations` (**cross-boundary**) | Test proving a retried reservation/decommitment neither duplicates rows nor decrements stock twice nor re-queues email; retry returns the same reference | T-02, T-03, T-17 (same service/repository files); migration tasks T-05/T-07 |
| T-02 | **Decimal policy for quantities.** Choose integer minor units or `numeric`-as-string with explicit decimal math; fix `validIncrement` (no float ratio comparison) and the capacity check; align the schema mode and the `mapWith(Number)` casts. Applies to donation item quantities/steps/commitments only (`price` is T-06). | W-02, W-03 | `jublawoma-data/src/{schema.ts,donation.service.ts,donation.repository.ts,donation.reader.ts,forms.ts}`, `tests/` | Unit tests: `0.1+0.2` capacity cases, large-ratio increments, step multiples; no float comparison of quantities remains | T-01 (shares `donation.service.ts`/`donation.repository.ts`) |
| T-03 | **Key-safe updates.** In the five composite-key/child repositories, stop spreading PK/FK columns into `SET` (or assert `key == values` and reject mismatches with a typed error). Keep the current PK semantics. | W-04 | `jublawoma-data/src/content/{story-image,donation-item}.repository.ts`, `unclet-data/src/content/showcase-image.repository.ts`, `zelglihof-data/src/content/{article-image,product-variant}.repository.ts`, studio validators `sites/studio/src/server/content/**/*.functions.ts` (**cross-boundary**) | Integration test: mismatched `key`/`values` cannot re-parent or rename a row | T-24 (W-19 consolidation rewrites the same files) — do T-03 before T-24 |
| T-04 | **Newsletter hardening.** Make `request()` update `unsubscribeToken` on conflict (or stop generating one on that path); turn `correctEmail` unique-violation and status transitions into typed outcomes; stop force-resetting status. | W-09 | `zelglihof-data/src/{newsletter.repository.ts,newsletter.subscribe.ts,subscriber.service.ts}` | Tests: re-subscribe keeps a valid token; correcting an email to an existing subscriber's address yields a typed conflict outcome, never a raw PG error | — |
| T-05 | **Persist inquiry subject.** Add the category column via a Flyway migration and write it; expose it in Studio's inquiry detail. | W-08 | `zelglihof-data/src/{schema.ts,forms.ts,inquiry.repository.ts,content/inquiry.ts,content/inquiry.repository.ts}`, `database/migrations/` (**cross-boundary**), studio inquiry view (**cross-boundary**) | Category round-trips form → DB → Studio | migration tasks T-01/T-07 (one migration file series — coordinate numbering) |
| T-06 | **Price as a structured value.** Replace free-text price with a validated numeric/CHF representation; keep display wording a presentation concern (owner decision pending). | W-07 | `zelglihof-data/src/{schema.ts,forms.ts,content/product.ts,content/product-variant.ts}`, `database/migrations/` (**cross-boundary**), studio product editors, `web/sites/zelglihof/src/data/products.ts` | Prices validate numerically; display uses one documented format | T-03 (shares product-variant repository) |
| T-07 | **DB constraints.** Add CHECK constraints (status domains, stars 1–5, quantities > 0, stock ≥ 0, date ranges) in Flyway after verifying/importing existing data. Keep request validation for feedback. | W-06 | `database/migrations/` (**cross-boundary**), Drizzle enum hints in 3 schemas | Constraints exist in SQL; invalid rows are rejected by the DB; documented in `database/README.md` | T-05/T-01 migration numbering; gated by O-010 |
| T-08 | **Orphan visibility policy.** Decide (owner) whether commitments/reservations with deleted parents are hidden, marked, or retained; implement the chosen behavior in the affected list queries. | W-10 | `jublawoma-data/src/content/donation-commitment.repository.ts`, `zelglihof-data/src/content/product-reservation.repository.ts`, studio list views (**cross-boundary**) | Documented policy + query behavior matching it | — |

### Phase 2 — boundaries and contracts (serialize T-09 and T-10; wide import churn)

| ID | Task | Findings | Files | Acceptance | Collides with |
| --- | --- | --- | --- | --- | --- |
| T-09 | **Rename colliding factories and types.** Name workflow repositories for their role (e.g. `createCommitmentRepository`, `createSubmissionRepository`) and content CRUD repositories consistently; disambiguate the four colliding type names. Update every importer. | W-11 | all 3 data packages (`src/*.repository.ts`, `src/content/*.ts`, `*.types.ts`, `forms.ts`) + studio/site importers (**cross-boundary**) | No two exports in one package share a name; auto-import cannot pick the wrong one | T-10 (same files/imports), T-24 (rewrites those repositories) |
| T-10 | **Explicit export surfaces.** Replace `"./*"` wildcards with deliberate entry points per package; drop redundant `"./contracts"` entries; fix `query`'s `.tsx`-only map; remove the unused `@oliumbi/queue` dependency from `jublawoma-data`; delete dead exports (`documentUrl`, `Actor`); un-export internal-only symbols; re-export `content-validation` from `contracts`' index. | W-12, W-14 | `web/packages/*/package.json`, `contracts/src/index.ts`, all importers (**cross-boundary**) | Every remaining export has ≥1 external consumer; `tsc` passes with explicit maps; a consumer cannot reach `schema.ts`/`*.tokens.ts` internals | T-09 (imports change twice — merge or sequence) |
| T-11 | **DTO boundaries.** Replace `$inferSelect` re-exports with deliberate public types where the shape is consumed across the boundary (follow `campaign.types.ts` / `content/subscriber.ts`); give `paginate` a typed result instead of `T["_"]["result"][number]`. Keep Drizzle inside data packages. | W-13 | `*/src/content/*.ts`, `database/src/pagination.ts` | Public types do not change when a DB column is renamed internally | T-06 price (product/variant content types), T-24 (rewrites `content/*.ts`) |
| T-12 | **Structured errors and outcomes.** Carry safe error codes, HTTP status and correlation IDs through `ServiceError` (parse the Java problem body without exposing internals); replace the 35 generic `Error` strings with typed outcomes (missing / forbidden / conflict); map PG 23505/23503 to those outcomes; widen the result unions (`unavailable` must distinguish its causes). | W-15, W-16, W-17 | `http-client/src/{index,error}.ts`, all `*/src/content/*.repository.ts`, `zelglihof-data/src/{campaign,subscriber}.service.ts`, `jublawoma-data/src/donation.service.ts`, studio server functions consuming them (**cross-boundary**) | Callers can branch reload / sign-in / retry on error codes; no raw `Error`/PG/Zod error crosses a server-function boundary | T-03/T-24 (same repository files), T-13 (status shapes) |
| T-13 | **Per-workflow status models.** Let each workflow own its allowed states (inquiry, reservation, message, review); share only genuinely identical vocabularies. | W-18 | `contracts/src/validation.ts`, `unclet-data/src/content/inquiry.ts`, `zelglihof-data/src/content/product-reservation.ts`, studio editors (**cross-boundary**) | Adding a reservation state does not widen inquiry inputs | T-12 (outcome shapes) |

### Phase 3 — deduplication (after Phase 1; before or merged with T-11)

| ID | Task | Findings | Files | Acceptance | Collides with |
| --- | --- | --- | --- | --- | --- |
| T-24 | **CRUD consolidation.** Collapse the four templates (~1,400 lines) into one parameterized factory (table, key columns, search column, input mapping). Preserve behavior exactly. Consider deduplicating the byte-identical cross-package files (promotion ×2, inquiry ×2) the same way or by explicit sharing — but respect `principles.md` P-011 and the `web/README.md` rule that the generic database package contains no site table names (the factory must stay table-agnostic). | W-19 | all `*/src/content/*.repository.ts`, `*/src/content/*.ts`, `database/src/` or a new shared module, studio importers (**cross-boundary**) | Behavior-identical (integration tests pass unchanged); line count drops ~1,000; no site table names in shared code | T-03, T-09, T-11 — must run after T-03 and coordinate with T-09/T-11 |

### Phase 4 — shared UI and forms

| ID | Task | Findings | Files | Acceptance | Collides with |
| --- | --- | --- | --- | --- | --- |
| T-14 | **Typed form contracts.** Tie field names/defaults to the input type; distinguish control kinds; preserve validation field paths and a small set of reasons; translate per reason and associate errors with fields. Share behavior, keep each site's visual design local. | W-20 | `ui/src/use-submission-form.ts`, `ui/src/form-feedback.tsx`, 3 sites' `submission-form.tsx`, studio `profile-password-form.tsx`, `i18n/messages/de-CH.json` | Renaming a domain field breaks compilation; each invalid field shows its own message | T-13 (validation shapes) |
| T-15 | **Pagination layout contract.** Make layout/styling explicit via a small composition point, or keep the visual wrapper per site. | W-21 | `ui/src/paginated-list.tsx`, 5 route consumers | The shared component no longer assumes a consumer CSS class | — |
| T-16 | **Support reference.** After T-01 fixes identity, give the reference a stable, non-guessable value tied to the submission identity. | W-22 | `queue/src/email.ts` | Reference is stable across retries and not guessable from row order | T-01 |

### Phase 5 — tooling, tests, docs

| ID | Task | Findings | Files | Acceptance | Collides with |
| --- | --- | --- | --- | --- | --- |
| T-17 | Align `@types/node` major with the Node 24 runtime; add `engines` consistently; keep versions in the pnpm catalog. | W-23 | `web/pnpm-workspace.yaml`, `web/package.json`, `web/tests/tsconfig.json` | Type check accepts only runtime-available APIs | — |
| T-18 | One container convention: consistent base-image pinning, copy order, `NODE_ENV`, explicit non-root user in web stages. | W-24 | `web/sites/*/Dockerfile` | Single documented convention, images run as non-root | — |
| T-19 | Give message generation an explicit owner and command; make route/message generation visible prerequisites of typecheck. | W-25 | `web/packages/i18n/vite.ts`, `web/package.json` scripts, `web/README.md` | Clean checkout: `typecheck` works after one documented generation step; concurrent dev servers cannot corrupt output | — |
| T-20 | CI: run `check`, `typecheck`, `test` on change; make the PostgreSQL integration test runnable (compose service + `STUDIO_TEST_ADMIN_URL`) or fail loudly when skipped; consider importing tests through package `exports`. | W-26 | `.github/workflows/`, `web/tests/*`, `web/package.json` | A red lint/type/test cannot reach a release; skip is visible | T-10 (test imports) |
| T-21 | Add unit tests for the workflow layers (services, newsletter flows, public repositories) — the money/stock/queue paths. Fold in tests for T-01…T-04. | W-27 | `web/tests/`, per-package tests if desired | Each submission workflow has retry, boundary and failure-path tests | T-01…T-04 (tests belong with those changes) |
| T-22 | Naming/semantics/strictness sweep: rename `upcoming`, dedupe the promotion window predicate, route unclet reviews through a service (or document why not), unify timestamp style, make public forms strict, replace `""` sentinels with nullable, consider `noUncheckedIndexedAccess` as its own commit (high churn). | W-28 | files in W-28 row | Each sub-item independently verifiable; no behavior change | T-24 (repositories), T-14 (forms) |
| T-23 | Documentation refresh after the refactor: update `code-quality-review.md`/`open-work.md` (or fold findings in), keep `web/README.md` accurate, record the idempotency and decimal decisions in `decisions.md`. | — | `documentation/*`, `web/README.md` | Trackers reflect post-refactor reality; no stale "open" items | run last |

## 6. Cross-report dedupe map

| This report | Already tracked as | Notes |
| --- | --- | --- |
| W-01 | R10, open-work "Prevent duplicate reservations and donation commitments after retries" | same root cause; this report adds the reference-instability detail |
| W-02, W-03 | R02 | this report adds the `validIncrement` tolerance bug and reproductions |
| W-05 | R08 | plus: studio never sends a token (verified) |
| W-06 | R07, open-work "Check constraints…" | migration line refs added |
| W-12, W-13 | R15 | `ui` is the model to copy |
| W-15 | R22 | plus R22's Java-side counterpart is out of scope here |
| W-18 | R14 | |
| W-20 | R20 + R21 | combined into one task (T-14) |
| W-21 | R28 | |
| W-23 | R32 | |
| W-24 | R34 | |
| W-25 | R31 | |
| W-26 | open-work "Run lint, type checks and builds in CI" | |
| W-04, W-07, W-08, W-09, W-10, W-11, W-14, W-16, W-17, W-19, W-22, W-27, W-28 | **NEW** | likely unique to this report — check sibling reports before creating duplicate tasks |

Out-of-scope counterparts referenced but not tasked: R01 (profile update may undo
an admin `enabled` change — fix in `services/identity` + studio profile flow; the
`identity` client's `updateAccount` input shape will need to change with it), R04
(campaign send disconnected from unsaved edits — `zelglihof-data/src/campaign.service.ts:39`
reads the saved body; a "require saved draft" contract is a small cross-boundary
change worth bundling with T-12), R11 (dirty editor state not reaching navigation),
R17 (queue DB grants exceed producer needs — `database/migrations/V001__schemas.sql:50`),
R19 (campaign batching unbounded — `campaign.service.ts:9-29`), R24 (duplicate
availability policy in `web/sites/zelglihof/src/data/products.ts` vs
`reservation.repository.ts:19`).

## 7. Decisions and exploration needed before/during the refactor

1. **Idempotency identity source** (T-01): hidden form token vs. per-session server
   token; storage as unique index vs. lookup; what "return the original outcome"
   means when the first response was never delivered. Needs a short written decision
   in `decisions.md` (principles require failure paths designed with the happy path).
2. **Decimal policy** (T-02): integer minor units vs. decimal strings; affects
   Studio number inputs and the donation unit wording (open-work: "donation units
   with the second developer").
3. **Price representation** (T-06): owner decision on display-only CHF wording is
   pending in open-work; representation choice is ours.
4. **O-010 (schema/migration ownership) is still open** — T-05/T-07 add migrations
   and should either follow the current per-capability convention or record the
   decision they imply.
5. **Where the CRUD factory lives** (T-24): `@oliumbi/database` (must stay
   table-agnostic per `web/README.md:26`) vs. a new shared module. P-011 ("extract
   after two real consumers") is satisfied by promotion ×2 and inquiry ×2.
6. **R01 companion**: whether `identity`'s `updateAccount` should stop carrying
   `enabled` at all (split admin vs. profile update) — this changes
   `web/packages/identity/src/index.ts` and the Java service together.
7. **Status vocabulary per workflow** (T-13): needs the owner decisions already
   listed in open-work (Uncle-T inquiry statuses, Zelglihof pickup statuses).
8. **`noUncheckedIndexedAccess`** (T-22): decide explicitly — high churn across all
   sites, but it is the only way the compiler enforces the current guard convention
   (`const [record] = …` is typed non-nullable today).

## 8. Invariants to preserve (do not regress these)

- Drizzle stays inside the data packages; repositories stay SQL-visible. No ORM
  migration is justified by these findings (`code-quality-review.md` "keep these choices").
- Reservation and donation operations keep their transactions and row locks;
  fixes must keep stock adjustment + queue insert atomic. Narrow `FOR UPDATE` to
  `FOR UPDATE OF` only if behavior-preserving (current join locks also cover the
  shared parent row — `reservation.repository.ts:12-29`, `donation.repository.ts:10-28`;
  correct but coarse).
- Queue enqueue runs in the caller's transaction (`queue/src/index.ts`) — keep it.
- Studio authorization stays server-side (`requireActor` checks, image ownership
  checks); do not move filtering to clients.
- pnpm catalog stays strict; versions do not move into child packages.
- Migration policy: Flyway owns migrations and DB constraints ("Flyway owns
  migrations and database constraints" comment in `queue/src/schema.ts`); destructive
  changes use expand → backfill → verify → contract; `timestamptz` UTC; exact
  numerics for money (this one is currently violated — T-02/T-06 restore it).
- No universal CMS configuration language or universal page renderer; share
  behavior, keep site visual design local (`principles.md` 3, `code-quality-review.md`
  "keep these choices").
- Public image proxying, site-local view models and the per-site data package
  boundaries stay as they are.

## 9. Verification commands

From `web/` after every task:

```
pnpm check
pnpm typecheck
pnpm test
pnpm build            # all four sites; --workspace-concurrency=1
```

With a database (see `web/tests/studio-repositories.test.ts`): set
`STUDIO_TEST_ADMIN_URL` and confirm the integration suite runs (not skips).
Compose config validation for container changes:
`docker compose -f infrastructure/compose.dev.yaml config`. Documentation links
were checked with the repository's doc-link conventions; re-check after T-23.
