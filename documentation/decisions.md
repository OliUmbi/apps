# Decisions

How we do things, in one place. Not an ADR archive: the maintainer is the main
developer, so direction and consequence matter more than rationale. Write a
full decision record only when someone outside the project needs the context.

## Fixed directions

| # | Direction | Consequence |
| --- | --- | --- |
| C-001 | One repository for the whole portfolio. | Shared tooling and discovery; no implied runtime coupling. |
| C-002 | Separate site applications replace the hostname-switched legacy SPA. | Own build, routes, image, release and rollback per site. |
| C-003 | TanStack Start for web applications. | Follow the framework; do not wrap it. |
| C-004 | PostgreSQL as the datastore. | Migrations, ownership, backup and restore designed before durable data. |
| C-005 | Docker Compose on one Linux host. | Health checks, private networks, durable volumes, pinned images. |
| C-006 | GitHub Actions for CI/CD. | Test and publish immutable artifacts. |
| C-007 | The reverse proxy is part of the managed system. | TLS and routing are versioned config, not host snowflakes. |
| C-008 | Backend components may use other languages. | Language-neutral contracts; every runtime needs the full toolchain. |
| C-009 | `legacy/` is temporary, for migration context only. | Knowledge moves into maintained documents before removal. |
| C-010 | Optimize for one maintainer and low traffic. | Understandability, cost and recovery outrank speculative scale. |

## Approved proposals

| # | Decision | Note |
| --- | --- | --- |
| P-001 | Browser traffic stays on the site's origin; server code calls internal services. | The legacy API-subdomain/CORS matrix was error-prone. |
| P-002 | Content, identity, workflows, media, messaging are logical capabilities first. | Split into services only when needed. |
| P-003 | Start with separated modules, not many processes. | Messaging is the first credible worker split. |
| P-004 | One shared administration app with site-scoped authorization. | Removes the six legacy public/admin roots. |
| P-005 | One PostgreSQL server, explicit ownership, restricted roles and schemas. | Schema-per-capability access discipline. |
| P-006 | Persist submissions and message jobs atomically, deliver asynchronously. | Provider failure must not lose a request. |
| P-007 | Media originals outside PostgreSQL, metadata inside, behind a storage contract. | Clean storage setup to be defined; legacy direction was right. |
| P-008 | Secure HTTP-only cookie sessions, not local-storage bearer tokens. | Standard browser session pattern. |
| P-009 | Immutable image tags; forward-compatible migrations before code. | Rollback stays practical. |
| P-010 | Prove conventions on the Zelglihof vertical slice first. | Real forms and workflows without legacy cutover. |
| P-011 | Extract shared code after two real consumers. | Prevents a restrictive universal component layer. |
| P-012 | Stable ecosystem frameworks over custom routing/DI/SQL/auth. | Code is limited to logic; legacy was too experimental. |

## Closed questions

| # | Answer |
| --- | --- |
| O-001 | First milestone: Zelglihof vertical slice, with some limitations. |
| O-002 | Uncle-T migrates first (urgency, lower risk). |
| O-003 | Logic mostly in TanStack site servers; split out only non-trivial operations (messaging is the prime candidate). |
| O-004 | CRUD stays in TanStack servers; where separate services are warranted, Java (Spring) is preferred. |
| O-005 | Administration is one app at `studio.oliumbi.ch`, all site `studio.*` names redirect there; mobile support needed. (The name "studio" replaces "admin".) |
| O-006 | **Open** — see below. |
| O-007 | Content is site-specific and custom-built; explicitly not a generic CMS. Scope in [sites.md](sites.md). |
| O-008 | Private server, media on disk, no CDN; reasonable default limits; revisit when relevant. |
| O-009 | Email via SMTP from the domain provider, deliberately simple now. Two mail identities per domain: a **requests** inbox (`hof@`, `info@`, `scharleitung@`) for form notifications and Reply-To, and a **newsletter@** sending identity for subscriber mail — separated so bulk mail cannot damage the deliverability of confirmations, and replies still reach a human. Strategy reviewed later. |
| O-010 | **Open** — see below. |
| O-011 | Requirements were low (monthly backups, up to a day to recover); now superseded: daily backups, pull to workstation, restore drills ([operations.md](operations.md)). |
| O-012 | Low availability requirements; now superseded: monitoring + alerting exist ([operations.md](operations.md)). |
| O-013 | Superseded: certbot/nginx plan replaced by containerized Caddy with DNS-01 wildcards; dynamic DNS handled by a server-side timer. |
| O-014 | Stability requirements low; beta versions acceptable; periodic upgrades without formal policy. |
| O-015 | German-only for the three client sites, Oliumbi mainly English; English URL strategy with permanent redirects; Paraglide for i18n; dates via a proper library, formatted per browser locale. |
| O-016 | No analytics; minimal third-party embeds. Instagram is an explicit requirement (Uncle-T, Jublawoma); review better embedding options. |
| O-017 | Owner confirmation is easy; small data sets may be migrated by hand. |

## Operations decisions (2026-10)

- Caddy in Docker, DNS-01 wildcards through Infomaniak; one API token covers
  certificates and the dyndns timer that keeps A records on the dynamic IP.
- No host firewall: the router forwards (80/443 + WireGuard) are the boundary;
  what containers publish and where they bind decides exposure.
- Recurring work (backup, housekeeping, dyndns) runs as systemd timers on the
  server, installed and triggered by Ansible over WireGuard. SSH is never
  public.
- Backups: daily `pg_dump` + media tarball, `age`-encrypted, three rotating
  copies on the server, pulled to the workstation; quarterly restore drill.
- Alerts: prometheus rules → alertmanager → ntfy topic to the phone.
- Deployments are manual and pinned by image tag; `latest` is never the
  deployment source. Rollback is deploying the previous tag.
- Server layout: the stacks live in `/apps`; secrets come from the ansible
  vault and never enter git.

## Still open

- **O-006 — authentication and account model.** Fewer than ten users; local
  passwords vs. an external provider, bootstrap/invitations, recovery,
  revocation, session duration, MFA need a decision and a short threat model.
  "External dependencies or simple self-built solutions could be realistic."
  Proposed resolution (owner to confirm): local password accounts — identity
  stores only BCrypt password hashes, session tokens are random 256-bit values
  kept only as SHA-256 hashes, and services authenticate to each other with
  internal bearer tokens from the environment. Fewer than ten users make an
  external provider unnecessary; sessions expire after seven days and are
  revoked server-side on password change or account disable. Recovery,
  invitations and MFA stay out until public accounts exist.
- **O-010 — schema and migration ownership.** No satisfactory approach found
  yet: schema-per-capability vs. domain split, migration tool and directory
  convention, locking, expand/contract procedure. Proposals wanted.
  Proposed resolution (owner to confirm): Flyway owns the schema; migrations
  live in `database/migrations`, one schema per capability as defined in V001
  (`queue`, `identity`, `messaging`, `assets`, `studio` and the site schemas).
  While the system is pre-launch, migration files are edited in place and the
  database is recreated from scratch (the sanction in `database/README.md`);
  once live data exists, destructive changes follow expand → backfill → verify
  → contract. The one-shot migrate container runs before the apps on every
  deploy, so no two migrators race.

Also closed: the Zelglihof domain is `zelglihof-maegenwil.ch` (the application
code had it right; documentation and infrastructure did not).

## Adopted for the 2026-10 refactoring pass

Adopted to unblock the refactoring pass
([refactoring-plan.md](refactoring-plan.md) §1). These are adopted-by-refactor
decisions, not long-term ratifications: review them here after the pass.

- **D1 — Idempotent public submissions.** Each public form carries a
  client-generated submission id (one UUID per form fill, hidden field). The
  service checks it in the existing transaction via a unique index and returns
  the original outcome on replay; references derive from the submission id and
  stay stable across retries.
- **D2 — Exact decimal quantities.** Quantities and steps stay `numeric` in
  PostgreSQL, are read and written as decimal strings, and all arithmetic uses
  BigInt-scaled integer math in TypeScript and `numeric`/`SUM` in SQL.
  `float64` never touches a quantity.
- **D3 — DB invariants.** CHECK constraints (status domains per workflow, stars
  1–5, positive quantities and steps, stock ≥ 0, date ranges) go into the
  owning migration files, edited in place under the pre-launch sanction.
  Request validation stays for feedback; Drizzle enum hints are not the
  enforcement mechanism.
- **D4 — Per-workflow status models.** Inquiry, reservation, message, review
  and campaign each own their allowed states. Shared spelling is not shared
  meaning.
- **D5 — Prices stay display-only text** for now. Display-only prices are
  `text`; money must be exact numerics as soon as amounts are computed. No
  schema change; the display wording is still an owner decision.
- **D6 — One shared Alert.** The reserved-space `Alert` (the product rule
  "state changes never move anything") is promoted to `@oliumbi/ui`;
  `FormFeedback` is retired everywhere.
- **D7 — Studio structure.** Search-param single-route navigation stays. The
  collection machinery is rebuilt around explicit capabilities (read-only /
  editable / creatable) with no component→route imports and one usage style for
  inline and routed collections. No universal CMS config language; per-type
  `*-view.tsx` files stay.
- **D8 — CRUD consolidation.** One table-agnostic repository factory in
  `@oliumbi/database` replaces the four copy-pasted templates. It must not
  contain site table names; behavior-identical and gated by integration tests.
- **D9 — Role passwords leave the migrations.** Roles are created `NOLOGIN`
  without passwords; credentials are provisioned per environment (dev bootstrap
  in `database/README.md`, production through the vault/Ansible flow).
- **D10 — Unsubscribe tokens stay plaintext this pass.** Hashing is a contract
  change with the zelglihof data package and is deferred; tracked in
  [open-work.md](open-work.md).
- **Site token decisions (landed with the pass).** Jublawoma gold unified on
  `honey #e3d4af`; footer muted text on `oat-soft #d5cbb9`; `clay` deleted
  (unused). Uncle-T dropped `ash` and adopted `paper`.
- **D6 outcome — Alert geometry.** One shared `Alert` behavior contract in
  `@oliumbi/ui`; each site keeps its local geometry. Rationale in
  `web/sites/studio/src/components/ui/README.md`.

## Layout rule: parts vs. subsystems

A **part** is independently deployable (a site, a service) and gets its own
directory; a **subsystem** is shared code (packages, modules) and lives inside
the workspace that builds it. Top-level directories are build workspaces or
their equivalents: `web/` (pnpm workspace: `sites/*` are parts, `packages/*`
subsystems), `services/` (Maven reactor: `identity`, `messaging`, `assets` are
parts, `shared` a subsystem), `database/` (SQL, shared by all), plus
`infrastructure/`, `ansible/`, `documentation/`, `legacy/`. A new workspace
gets a new top-level directory; a new deployable joins its workspace.

## Stack

pnpm workspaces, TypeScript (strict), React 19, TanStack Start + TanStack
Router + TanStack Query, Vite + Nitro (Node 24), Tailwind 4, Base UI, Lucide,
Biome; Spring Boot (Java) services with actuator; PostgreSQL 18 with Flyway
migrations; Caddy, Docker Compose, GitHub Actions.
