# AGENTS.md

Orientation and working rules for agents (and new humans). Read this first,
then follow the reading order in [documentation/README.md](documentation/README.md)
as deeply as the task requires. This file stays shallow on purpose; current
implementation details live in the README next to the code they describe.

## Project overview

OliUmbi Apps is a monorepo for five web applications: four public websites
with distinct identities (jublawoma.ch, uncle-t.ch, zelglihof-maegenwil.ch, and
oliumbi.ch - currently a static English placeholder) plus Studio (the shared
content and account administration app), three Java services (Identity,
Messaging, Assets), and their shared PostgreSQL schema. The system in `legacy/`
is being replaced
([documentation/work/migration.md](documentation/work/migration.md)).

Constraints: low traffic, one primary developer. TypeScript and TanStack Start
in the browser, PostgreSQL as the datastore, Docker Compose for local
development, systemd (podman/Quadlet) for deployment, GitHub Actions for
CI/CD. When principles conflict, the quality order in
[documentation/principles.md](documentation/principles.md) breaks the tie:
data integrity and security first, then recoverability, then maintainability.

## Repository map

| Path | Contents |
| --- | --- |
| `web/` | pnpm workspace: five sites (`sites/{studio,jublawoma,unclet,zelglihof,oliumbi}`) and shared packages (`packages/`: data, contracts, ui, i18n, http-client, ...) |
| `services/` | Maven reactor (JDK 25): `shared`, `identity`, `messaging`, `assets` |
| `database/` | Flyway migrations - the schema source of truth (see `database/README.md`) |
| `infrastructure/` | systemd units (podman/Quadlet), Caddy, dev compose + `.env.dev`, monitoring |
| `ansible/` | Server bootstrap, deploy, backup and housekeeping playbooks |
| `documentation/` | The project's brain: architecture, operations, development, reference, work registers and frozen history |
| `legacy/` | The system being replaced - reference only, never a place to work |
| `media/` | Image and document staging storage |

Stack summary: TanStack Start + Vite + Tailwind + Base UI + TanStack Query on
the web side; Drizzle for queries (Flyway owns schema and constraints); Spring
Boot services reached over HTTP with typed clients (`web/packages/identity`,
`assets`, `messaging`). `web/README.md` and `services/README.md` carry the
package and module details.

## Local development

Requirements: Docker Desktop, Node.js 26+, pnpm 11+, JDK 25, Maven 3.9.12
(`services/mvnw` wrapper pins it).

```powershell
Copy-Item infrastructure/.env.dev .env   # gitignored local values
docker compose -f infrastructure/compose.dev.yaml --env-file .env up -d --build
```

Sites run at localhost:8000-8004 (studio, jublawoma, unclet, zelglihof,
oliumbi), Java services at 8081-8083, dev email in Mailpit at
<http://localhost:8025>. For frontend work, keep only infrastructure in Docker
(`up -d postgres flyway mailpit`) and run `pnpm dev:<site>` from `web/`;
Studio additionally needs the identity and assets services. Never commit
secrets and never reuse the development credentials in a deployed environment.

## Verification (the gate)

Every task ends with the checks that cover what it touched. Full gate:
[documentation/development/verification.md](documentation/development/verification.md).
From `web/`:

```powershell
pnpm check       # Biome style/lint - must be exit 0
pnpm typecheck   # runs pnpm generate first; fails on stale route trees
pnpm test        # node:test suite (tsx)
pnpm build       # all five sites
pnpm --filter studio build   # REQUIRED after any web/packages/* change
```

From the repository root, Java and infra checks:

```powershell
services\mvnw.cmd -f services/pom.xml test
docker compose -f infrastructure/compose.dev.yaml config   # after compose.dev changes (dev rig; units and playbooks are checked in CI)
```

PowerShell caveat: piping native commands with `2>&1 |` marks the pipeline
failed even when the command succeeded. Judge success by the output or
`$LASTEXITCODE` after an unpiped run.

Two workflow details that surprise newcomers: `pnpm generate` (from `web/`) is
the single owner of the git-ignored i18n output - edit the source catalog
`packages/i18n/messages/de-CH.json`, never generated files. Route trees
(`src/routeTree.gen.ts`) are committed; regenerate via `pnpm dev`/`pnpm build`
and commit them after changing routes.

## Working rules (do not regress)

The full list lives in [documentation/principles.md](documentation/principles.md)
and [documentation/history/refactoring-plan.md](documentation/history/refactoring-plan.md)
section 4. The ones most often violated:

- Layering is one-way: `routes -> components -> data (server functions) ->
  *-data packages`. Components never import routes.
- Drizzle stays inside data packages; repositories stay SQL-visible. The
  generic `database` package contains no site table names.
- Everything crossing a boundary is validated and versioned; errors are values
  (`{ outcome: ... }`) at public boundaries, not thrown surprises. Types do
  not exist at runtime - validate at entry points.
- Stock and donation capacity use transactions with row locks; queue enqueue
  runs in the caller's transaction and stays atomic with the write.
- Studio authorization stays server-side (`requireActor`, ownership checks).
- Sites are independent: site-specific wording, layout and branding stay in
  the site. No universal component layer.
- Flyway owns schema and constraints. Pre-launch, migrations are edited in
  place; recreate the local database after a migration changes.
- Comments explain constraints and rationale, never restate code. No new
  TODO/FIXME markers (tracked work goes to `documentation/work/open-work.md` or
  `documentation/work/tech-debt.md`).
- Every deployable unit keeps a nearby README: setup, configuration,
  contracts, health and commands. Documentation changes are reviewed together
  with the behavior changes they describe.
- Small functions, domain-based names, pure transformations with explicit
  side effects. Accessibility, responsive behavior, metadata and error states
  are part of the feature, not polish.

## Task tracking

Four mechanisms, in order of use:

1. **The work registers are the live checklist.** `documentation/work/open-work.md`
   holds actionable tasks as `- [ ]` items in topical sections (Launch gate,
   Infrastructure, Product features, Design, Owner decisions, Later).
   `documentation/work/tech-debt.md` holds structural debt with a `TD-*` ID,
   severity and next action. When a task resolves an item, remove it or check it
   off with a short parenthetical status note, e.g.
   `(code complete in the 2026-10 refactor - verify in staging)`. When a task
   creates unfinished work, add it to one of the two registers. Nothing
   unfinished lives only in a commit message or a chat log.
2. **Work packages for multi-step work.** Larger efforts get a plan document
   with numbered packages (`W1-A`, `W5-B`, ...), each with exclusive file
   ownership ("a package may only write its listed paths"), findings to close,
   and acceptance criteria. Progress is recorded in an execution-log table
   (`| ID | Status | Notes |`) inside the plan, and the package ID is carried
   in every commit. See `documentation/history/refactoring-plan.md` for the
   worked example (status: COMPLETE - do not reopen it).
3. **Findings carry IDs and dispositions.** Review findings are numbered
   (`W-*` web, `X-*` cross-site, `J-*`/`U-*`/`Z-*` per site, `RS-*` services,
   `T-*`/`F-*` studio). When you fix or triage one, annotate it in place:
   `*Disposition (YYYY-MM): fixed (W2-D) - what changed.*`
   (`open` / `already resolved` / `in progress` are also valid). Evidence
   documents are never silently rewritten.
4. **`documentation/reference/decisions.md` holds directions.** Adopted
   decisions get a `D*` entry and open questions keep an `O-*` number (e.g.
   O-006 auth model). Decision-gated and owner-gated items are recorded, not
   coded - leave them open and note what is blocked.

Commit message convention (from `git log`):

```text
<scope>: <imperative summary> (<work-id>)      # e.g. web/packages: one table-agnostic content CRUD factory (W2-D)
docs: <summary>                                # documentation-only changes
```

Scope is the touched area (`studio`, `web/packages`, `services/messaging`,
`database+web`, ...), not the file. Small untracked fixes may omit the
work-id. Keep commits reviewable; commit docs updates together with the change
they describe, or as an explicit follow-up like `docs: sync ...`.

## Documentation reading order

1. [documentation/principles.md](documentation/principles.md) - why, quality order, guidelines
2. [documentation/architecture/README.md](documentation/architecture/README.md) - system map, boundaries, environments
3. [documentation/architecture/layers.md](documentation/architecture/layers.md) - layers, dependency rules, flows
4. [documentation/architecture/subsystems/](documentation/architecture/subsystems/README.md) - web, Studio, identity, messaging, assets, data, edge
5. [documentation/reference/sites.md](documentation/reference/sites.md) and [glossary](documentation/reference/glossary.md) - capabilities and vocabulary
6. [documentation/operations/README.md](documentation/operations/README.md) - deploy, backup, monitoring, runbooks
7. [documentation/development/README.md](documentation/development/README.md) - setup, verification, CI/CD
8. [documentation/work/open-work.md](documentation/work/open-work.md) and [tech-debt.md](documentation/work/tech-debt.md) - everything unfinished
9. [documentation/reference/decisions.md](documentation/reference/decisions.md) - directions and open questions
10. [documentation/history/README.md](documentation/history/README.md) - frozen reviews and completed plans (evidence)
