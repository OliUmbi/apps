# Refactoring plan

Execution plan for the 2026-10 refactoring pass. It merges the four handoff
reports (`refactoring-web-packages.md`, `refactoring-web-sites.md`,
`refactoring-web-studio.md`, `refactoring-services.md`) with
`code-quality-review.md` and `open-work.md` into one ordered set of work
packages with exclusive file ownership, so subagents can run in parallel
without write collisions.

This is an execution document. When it disagrees with a handoff report, this
document wins for sequencing and ownership; the reports stay authoritative for
finding evidence (`W-*`, `X-*`, `J-*`, `U-*`, `Z-*`, `RS-*`, `R*`).

## 0. Scope and priorities

Ordered by `principles.md` quality attributes: data integrity and security
first, then recoverability, then maintainability (structure and naming), then
accessibility/correctness, then everything else.

In scope: `web/**`, `services/**`, `database/**`, `documentation/**`, CI
(`.github/`). Out of scope: `ansible/**`, `infrastructure/**` (deployed-state
work tracked in `open-work.md`), `legacy/**`, visual redesigns.

## 1. Decisions adopted for this pass

These resolve the reports' "decision-gated" items. Recorded here and in
`decisions.md`; revisit there, not in code review.

| # | Decision |
| --- | --- |
| D1 | **Idempotent public submissions.** Each public form carries a client-generated submission id (UUID, one per form fill, hidden field). The service checks it inside the existing transaction via a unique index and returns the original outcome on replay. References derive from the submission id and are therefore stable across retries. Applies to zelglihof reservations, zelglihof/unclet inquiries, jublawoma donation commitments. |
| D2 | **Exact decimal quantities.** Quantities/steps stay `numeric` in PostgreSQL but are read and written as decimal strings; all arithmetic (increment checks, capacity sums) uses BigInt-scaled integer math in TS and `numeric`/`SUM` in SQL. `float64` never touches a quantity (closes W-02, W-03, sharpens R02). |
| D3 | **DB invariants.** CHECK constraints (status domains per workflow, stars 1–5, quantity/step > 0, stock ≥ 0, date ranges) are added to the owning migration files, edited in place (pre-launch sanction in `database/README.md`). Request validation stays for feedback. Drizzle enum hints are not the enforcement mechanism. |
| D4 | **Per-workflow status models.** `statusValues` in `contracts` is split so inquiry, reservation, message, review and campaign each own their allowed states (closes W-18/R14). Shared spelling is not shared meaning. |
| D5 | **Prices stay display-only text** for now (owner wording decision open). `architecture.md` is amended to say: display-only prices are text; computed money must be exact numeric. No schema change (matches RS-E6 doc-side option). |
| D6 | **Alert/form feedback.** `Alert` (reserved-space, the product rule "state changes never move anything") is promoted to `@oliumbi/ui`; `FormFeedback` is retired everywhere (closes F11, X-10, W-20 part). One shared behavior with four consumers justifies the share (`principles.md` 3). |
| D7 | **Studio structure.** Keep search-param single-route navigation. Rebuild the collection machinery around explicit capabilities, remove component→route imports (R12), unify inline vs routed collection usage, model read-only/editable/creatable explicitly (R13). No universal CMS config language; per-type `*-view.tsx` files stay. |
| D8 | **CRUD consolidation.** One table-agnostic repository factory replaces the four copy-pasted templates (W-19). It lives in `@oliumbi/database` and must not contain site table names (`web/README.md` rule). Behavior-identical; the integration tests gate it. |
| D9 | **Role passwords** leave the migrations (RS-E1): roles are created `NOLOGIN` without passwords; credentials are provisioned per environment. Dev bootstrap documented in `database/README.md`. |
| D10 | **Unsubscribe tokens** stay plaintext this pass (RS-E5 left open; hashing is a contract change with the zelglihof data package — tracked in `open-work.md`). |

## 2. Baseline and verification

Verified at plan time: `pnpm typecheck` green, `pnpm test` 15 pass / 1 skipped
(needs `STUDIO_TEST_ADMIN_URL` + PostgreSQL), `pnpm check` green, `mvn test`
green (66 tests).

Commands (from `web/`):

```powershell
pnpm check       # Biome style/lint — must be exit 0
pnpm typecheck   # tsc per package/site + tests project
pnpm test        # node:test suite (tsx)
pnpm build       # all four sites, serialized workspace build
pnpm --filter studio build   # REQUIRED after any web/packages/* change
```

Java (from repo root):

```powershell
& "C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2024.3.5\plugins\maven\lib\maven3\bin\mvn.cmd" -f services/pom.xml test
```

`mvn` is not on PATH in this environment; use the IntelliJ-bundled Maven above.
Compose validation after container/infra-adjacent changes:
`docker compose -f infrastructure/compose.dev.yaml config`.

PowerShell note: piping native commands with `2>&1 |` marks the pipeline failed
even when the command succeeded — judge success by the output or
`$LASTEXITCODE` after an unpiped run, not by the harness exit code of a pipe.

Per-task rule: every work package ends with `pnpm check`, `pnpm typecheck`,
`pnpm test` green plus the module-relevant build. Java packages end with
`mvn test` green.

## 3. Work packages

Ownership rule: a package may only write its listed paths. Everything else is
read-only. Where two packages need the same file, the later one waits (the
dispatch order enforces this).

### Wave 0 — baseline (done by the orchestrator)

- W0-1 Biome baseline restored (formatting sweep) and `ui/checkbox.tsx`
  label/association lint fixed. ✅
- W0-2 This plan committed. ✅

### Wave 1 — data correctness and DB invariants (serialized)

| ID | Package | Findings | Owns | Acceptance |
| --- | --- | --- | --- | --- |
| W1-A | **Idempotent submissions + decimal quantities + stable references** | W-01, W-02, W-03, W-22, X-05, Z-11, R02, R10 (D1, D2) | `web/packages/{jublawoma,unclet,zelglihof}-data/src/` workflow files (`donation.*`, `reservation.*`, `inquiry.service.ts`, `newsletter*` untouched), `web/packages/queue/src/`, `database/migrations/` (new file only), `web/sites/{jublawoma,unclet,zelglihof}/src/data/` + submission components' payload wiring, `web/tests/` | Retried submission: no duplicate row, no double stock decrement, no duplicate queued email, same reference. `0.1+0.2` capacity and step-multiple cases unit-tested. No `Number()` on quantity paths. |
| W1-B | **DB invariants and repository integrity** | W-04, W-06, W-08, W-09, W-10, RS-E1, RS-E2, RS-E3, R07, R08-adjacent (D3, D9) | `database/migrations/**` (V001–V010 in place + numbering after W1-A's file), `web/packages/{jublawoma,unclet,zelglihof}-data/src/schema.ts`, `content/*.repository.ts`, `content/*.ts`, zelglihof newsletter files, `database/README.md` | CHECK constraints reject invalid rows; `update()` cannot rewrite PK/FK (typed conflict outcome); inquiry subject persists and shows in Studio; newsletter token survives re-subscribe; no password literal in `database/`; session indexes exist. |
| W1-C | **Optimistic concurrency for content edits** | W-05, R08 | `web/packages/*/src/content/*.repository.ts` (after W1-B), `web/sites/studio/src/components/content/content-form.tsx` + server functions' update validators | Concurrent save reports a conflict instead of silently winning; `updatedAt` compared in the update transaction. |

### Wave 2 — shared packages: structure, naming, contracts

| ID | Package | Findings | Owns | Acceptance |
| --- | --- | --- | --- | --- |
| W2-A | **Typed submission contracts + PaginatedList + shared Alert** | W-20, W-21, X-01, X-02, X-03, X-10, R20, R21, R28 (D6) | `web/packages/ui/src/**`, `web/packages/i18n/` (fragment file for new keys) | Field names typed against the input schema (a renamed field breaks compile); per-field errors with distinct reasons; `PaginatedList` no longer emits an undefined `shell` class; `Alert` exported for all sites; studio still type-checks. |
| W2-B | **Package boundaries, naming, DTOs, statuses** | W-11, W-12, W-13, W-14, W-18, R14, R15 (D4) | `web/packages/*/package.json`, `*/src/**` type/rename churn, `contracts/src/**`, all importers (sites + studio) | No colliding exports; deliberate export maps; Drizzle types not exported as DTOs; each workflow owns its status vocabulary. |
| W2-C | **Structured errors and outcomes** | W-15, W-16, W-17, R22 (and R04 companion: require saved draft before campaign send) | `web/packages/http-client/src/**`, `*/src/**` service/repository error paths, studio server functions consuming them | No raw `Error`/PG/Zod error crosses a server-function boundary; callers can branch sign-in vs retry vs conflict; `ServiceError` carries status + code + error id. |
| W2-D | **CRUD consolidation** | W-19 (D8) | `web/packages/{jublawoma,unclet,zelglihof}-data/src/content/**`, `web/packages/database/src/` (factory), studio importers | ~1,000 lines removed, behavior identical, integration tests pass unchanged, no site table names in `database/`. |

### Wave 3 — public sites (3 parallel lanes; `de-CH.json` via fragments)

Each lane owns its site tree end to end: design tokens + class dedup (B),
component cleanup and behavior fixes (C), metadata, form adoption per W2-A.

| ID | Package | Findings | Owns |
| --- | --- | --- | --- |
| W3-A | **jublawoma** | J-01…J-19, X-06…X-09 site parts | `web/sites/jublawoma/src/**`, fragment `web/packages/i18n/messages/fragments/jublawoma.json` |
| W3-B | **unclet** | U-01…U-20, D4 showcase payload | `web/sites/unclet/src/**`, `web/packages/unclet-data/src/public.repository.ts`, fragment `…/fragments/unclet.json` |
| W3-C | **zelglihof** | Z-01…Z-21 (except Z-16, Z-19 code), D1 availability policy | `web/sites/zelglihof/src/**`, `web/packages/zelglihof-data/src/` availability/newsletter files, fragment `…/fragments/zelglihof.json` |
| W3-D | **catalog merge + cross-site** | X-08, X-09 leftovers | `web/packages/i18n/messages/de-CH.json` (merge fragments), then run all builds |

Owner-gated items are excluded from all lanes (see §5).

### Wave 4 — studio (serialized)

| ID | Package | Findings | Owns |
| --- | --- | --- | --- |
| W4-A | **Leaf layer completion + legacy CSS deletion** | F1…F13, T-01…T-11 | `web/sites/studio/src/components/ui/**`, `styles.css`, `gradients.css`, shim deletions |
| W4-B | **View completion across content/accounts/messages/assets** | T-04…T-08 leftovers, F10, F11 | `web/sites/studio/src/components/**` (outside `ui/`) |
| W4-C | **Structural rework: collection machinery + page types** | R12, R13, D7 | `web/sites/studio/src/{model,hooks,components/content,routes,server}/**` |

### Wave 5 — Java services (parallel lanes; no migration edits — those landed in W1-B)

| ID | Package | Findings | Owns |
| --- | --- | --- | --- |
| W5-A | **messaging hardening** | RS-A1…RS-A13 | `services/messaging/**` |
| W5-B | **identity + shared contract** | RS-B1…RS-B8, RS-D1…RS-D4 | `services/identity/**`, `services/shared/**` + all controllers' auth handling |
| W5-C | **assets hardening + pipeline tests** | RS-C1…RS-C8 | `services/assets/**` |
| W5-D | **services docs** | RS-F1…RS-F5 | `services/**/README.md`, `documentation/architecture.md`, `documentation/decisions.md` (drafts) |

### Wave 6 — tooling, tests, docs sync

| ID | Package | Findings | Owns |
| --- | --- | --- | --- |
| W6-A | **toolchain consistency** | W-23, W-24, W-25, W-26, R31, R32, R33, R34 | `web/pnpm-workspace.yaml`, `web/package.json`, `web/sites/*/Dockerfile`, `web/packages/i18n/vite.ts`, `.github/workflows/**` |
| W6-B | **workflow unit tests (web)** | W-27 | `web/tests/**` |
| W6-C | **documentation sync** | D6 (sites report), T-23, W-28 leftovers, RS-F5, open-work refresh | `documentation/**`, `web/README.md` |

## 4. Invariants (do not regress)

From the reports' "keep these" lists; every package must preserve them:

1. One-way layering: `routes → components → data (server functions) → *-data
   packages`. No component imports a route (this is a target for W4-C, not a
   license to add more).
2. Transactions + row locks for stock and donation capacity stay; stock
   adjustment + queue insert stay atomic; queue enqueue runs in the caller's
   transaction.
3. One Zod schema per public form shared by client and server; errors are
   values (`{ outcome: … }`), not throws, at the public boundary.
4. Drizzle stays inside data packages; repositories stay SQL-visible; no ORM
   migration; Flyway owns schema and constraints.
5. Studio authorization stays server-side (`requireActor`, ownership checks).
6. Site-specific wording, layout and branding stay in the site; no universal
   component layer.
7. Existing accessibility wins stay (reduced-motion, `role="alert"|"status"`,
   deterministic date rendering in jublawoma).
8. Visual styling in studio lives only in `src/components/ui/`; views use
   layout/spacing utilities; state changes never move anything (reserved
   alert/field-message slots).
9. `pnpm check` / `pnpm typecheck` / `pnpm test` / relevant builds green after
   every package; `mvn test` green for Java packages; no behavior change in a
   styling refactor.
10. No secrets in git; no new TODO/FIXME; comments explain constraints, never
    restate code.

## 5. Owner-gated (leave open; record, do not code)

- `@zelglihof.ch` vs `zelglihof-maegenwil.ch` mailboxes (Z-16).
- Contact `subject` category set (Z-10 keeps the enum; the select stays out).
- Uncle-T phone-only replies; review consent + privacy wording (U-13).
- Zelglihof farm facts / crop names content (Z-04 data part).
- Jubla fonts decision, review-token "persönlicher Link" copy (U-12 copy may
  only be made honest, not feature-expanded).
- Review-consent legal wording.

## 6. Execution log

| Package | Status | Notes |
| --- | --- | --- |
| W0-1, W0-2 | done | baseline green; plan committed |
| W1-A | dispatched | |
| W1-B | pending | |
| W1-C | pending | |
| W2-A | pending | |
| W2-B | pending | |
| W2-C | pending | |
| W2-D | pending | |
| W3-A | pending | |
| W3-B | pending | |
| W3-C | pending | |
| W3-D | pending | |
| W4-A | pending | |
| W4-B | pending | |
| W4-C | pending | |
| W5-A | pending | |
| W5-B | pending | |
| W5-C | pending | |
| W5-D | pending | |
| W6-A | pending | |
| W6-B | pending | |
| W6-C | pending | |
