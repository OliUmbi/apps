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
- **O-010 — schema and migration ownership.** No satisfactory approach found
  yet: schema-per-capability vs. domain split, migration tool and directory
  convention, locking, expand/contract procedure. Proposals wanted.

Also closed: the Zelglihof domain is `zelglihof-maegenwil.ch` (the application
code had it right; documentation and infrastructure did not).

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
