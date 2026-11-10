# Architecture

Four public websites - `jublawoma.ch`, `uncle-t.ch`,
`zelglihof-maegenwil.ch` and `oliumbi.ch` - plus one administration application
(Studio), served from a single Linux host with a single PostgreSQL database.
The Oliumbi site is currently a static English placeholder; its full content
comes later. This page is the system map. The
[layer view](layers.md) explains the dependency rules inside it, and the
[subsystem pages](subsystems/README.md) explain each part in depth.

For why the system is shaped this way, read [principles](../principles.md) and
[decisions](../reference/decisions.md). For how it runs, read
[operations](../operations/README.md). For what is unfinished, read
[work](../work/README.md).

## Drivers

Low traffic, one maintainer, five distinct web applications, private
administration and durable data. The repository is shared for discovery and
coordinated change. Each site application is independently buildable and
deployable. Capabilities
have explicit ownership and contracts. A capability becomes its own process only
when that makes the whole system simpler or safer.

## Level 1 - system context

```text
                    visitors / owners / editors
                              │ HTTPS
                              ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                        the managed host                       │
 │  Caddy (TLS, routing) → sites / Studio → services → DB        │
 └───────┬───────────────────────────────────────────┬──────────┘
         │                                           │
         │ DNS-01 + A-record updates                 │ SMTP
         ▼                                           ▼
  Infomaniak DNS / ACME                       mail provider
         ▲
         │ ansible, WireGuard, ghcr pulls
         │
   maintainer workstation ──────► GitHub Actions ──────► ghcr.io/oliumbi/apps-*
```

External dependencies: Infomaniak (DNS and ACME), the mail provider (SMTP), the
ntfy topic (alerts), GitHub Actions and ghcr (build and images). The maintainer
workstation reaches the host only over WireGuard; it is also the place backups
are pulled to.

## Level 2 - containers and deployment units

```text
 Internet
    │
    ▼
 ┌─ edge ───────────────────────────────────────────────────────┐
 │ caddy    TLS (DNS-01 wildcards), routing, headers, limits    │
 │ dyndns   systemd timer: keeps Infomaniak A records current    │
 │          [infrastructure/]                                    │
 └────┬─────────────────────────────────────────────────────────┘
      │
 ┌─ web/ ───────────────────────────────────────────────────────┐
 │ TanStack Start (React, Vite, Nitro), SSR on Node             │
 │ jublawoma :8001   unclet :8002   zelglihof :8003             │
 │ oliumbi   :8004 (static placeholder)                         │
 │ studio    :8000 (administration for all sites)               │
 └────┬─────────────────────────────────────────────────────────┘
      │
 ┌─ services/ ──────────────────────────────────────────────────┐
 │ Spring Boot on the internal network only                     │
 │ identity :8081   messaging :8082   assets :8083              │
 └────┬─────────────────────────────────────────────────────────┘
      │
 ┌─ data ───────────────────────────────────────────────────────┐
 │ postgres 18 · one database · one role and schema per app     │
 │ state: /var/lib/apps (postgres, media, caddy)                │
 └──────────────────────────────────────────────────────────────┘

 Every workload above is one systemd unit (podman/Quadlet) in production.
 Local development uses Docker Compose and is deliberately not a mirror.
```

## Components and ownership

| Component | Purpose | Owns | Detail |
| --- | --- | --- | --- |
| caddy | TLS via DNS-01, hostname routing, security headers, CSP, rate limits, body limits | certificates in `/var/lib/apps/caddy-data` | [edge](subsystems/edge.md) |
| dyndns | timer that keeps the Infomaniak A records on the dynamic IP | - | [edge](subsystems/edge.md) |
| sites (jublawoma, unclet, zelglihof) | public SSR websites; own routes, content and forms | their own schema | [web apps](subsystems/web-apps.md) |
| oliumbi | static English placeholder; no database or service dependencies | its own route wording | [web apps](subsystems/web-apps.md) |
| studio | admin UI for all sites; one hostname so sessions survive | - | [studio](subsystems/studio.md) |
| identity | accounts, sessions, permissions | `identity` schema | [identity](subsystems/identity.md) |
| messaging | email queue intake, delivery, history | `messaging` schema | [messaging](subsystems/messaging.md) |
| assets | image/document storage and size variants | `assets` schema + `/var/lib/apps/media` | [assets](subsystems/assets.md) |
| postgres | the one database; each app has its own role and schema | all durable data | [data](subsystems/data-and-schema.md) |
| migrate | Flyway, runs before the apps on every deploy | `database/migrations` | [data](subsystems/data-and-schema.md) |

## Key flows

- **Page request** - browser → caddy (TLS, route by host) → site SSR →
  postgres. A site reads its own schema directly; cross-app data goes through a
  service.
- **Public form** - browser → site server function → validation → one database
  transaction (durable row, stock/capacity lock, queue insert) → response with a
  stable reference. Retries with the same submission id return the original
  outcome.
- **Public image** - page requests `/api/assets/<id>?size=...` → site server
  function → assets service → browser receives the image with the `Cache-Control`
  and `ETag` set by assets (304 supported).
- **Upload** - Studio → assets service → `/var/lib/apps/media`, metadata in
  postgres.
- **Email** - site or Studio server function → `queue.message` in its
  transaction → messaging worker → SMTP → delivery history.
- **Sign-in** - browser POSTs to Studio's `/api/session/login` route → identity
  (internal bearer token) → session cookie (HTTP-only, same-site) → Studio
  authorization checks on every server call. Caddy applies a stricter login
  rate limit to that path.
- **Release** - version tag → CI verifies, builds and publishes images → the
  maintainer runs the deploy playbook with an explicit pinned tag → migrate →
  provision database roles → apps → caddy. See
  [deployment](../operations/deployment.md).

The exact call chains and allowed dependencies are in the
[layer view](layers.md).

## Boundaries and data ownership

**When to split a service.** A different failure or release lifecycle, a
materially different security boundary, background work unsuitable for HTTP, a
language with a concrete benefit, or a shared need that would otherwise couple
databases. Never split just to mirror a folder - every service adds contracts,
deployment order, networking, observability and failure modes.

**Contracts.** Validate everything crossing a boundary (request, environment
value, provider response, stored payload). Use stable identifiers, not database
row shapes. Return structured outcomes, never parseable messages. Carry a
correlation id through proxy, site, services and jobs. Design writes for
duplicate delivery. Version breaking process-boundary contracts explicitly.

**Data.** One PostgreSQL server does not mean one access model. Each owner gets
a role with only the permissions it needs, and only the owning capability writes
its tables; everyone else uses a contract or a reviewed view. A migration
belongs to the unit that owns its model and runs before the code needing it.
Destructive changes use expand → backfill → verify → contract. Timestamps are
`timestamptz` in UTC. Prices are display-only `text` until money is computed,
then exact numerics. Quantity columns are exact numerics read and written as
decimal strings. Constraints and deletion behavior are part of the domain model.
Seed data stays outside production migrations.

## Environments

| | development | production |
| --- | --- | --- |
| runtime | `infrastructure/compose.dev.yaml` (Docker Desktop) | systemd units from `infrastructure/units/` (podman/Quadlet) |
| config | root `.env` (gitignored; template `infrastructure/.env.dev`) | per-service `/etc/default/apps-*` rendered from the vault |
| images | built locally | `ghcr.io/oliumbi/apps-*` pinned by an explicit `image_tag` (`latest` rejected) |
| migrations | bind mount, edited in place | baked into `apps-migrate:<tag>` |
| email | Mailpit | real SMTP |
| TLS | none | caddy, DNS-01 wildcards |

Deployment and rollback are documented once in
[operations/deployment.md](../operations/deployment.md). Local development is
documented once in [development/local-setup.md](../development/local-setup.md).

## Repository map

| Path | Content |
| --- | --- |
| `web/` | TanStack Start sites and shared packages (pnpm) - [web/README.md](../../web/README.md) |
| `services/` | Spring Boot services and shared module (Maven) - [services/README.md](../../services/README.md) |
| `database/` | Flyway migrations, the schema source of truth - [database/README.md](../../database/README.md) |
| `infrastructure/` | systemd units, monitoring, Caddyfile, dev compose |
| `ansible/` | the operations interface: server setup, deploy, backup, housekeeping |
| `documentation/` | this tree |
| `legacy/` | the currently running old stack, read-only reference |

## Conventions

- Configuration is environment only. Secrets never enter git (`.env` is
  ignored; values live in the Ansible vault).
- Each app owns its schema; no cross-app SQL. Shared behavior lives in shared
  packages/modules, never in another site's code.
- Ports: sites and Studio `8000-8004`, services `8081-8083`. Nothing else is
  published. Oliumbi is `8004`.
- Public hostnames are defined in one place, `infrastructure/caddy/Caddyfile`:
  `jublawoma.ch`, `uncle-t.ch`, `zelglihof-maegenwil.ch`, `oliumbi.ch`,
  `studio.oliumbi.ch`. Other `admin.*`/`studio.*`/`www.*` names redirect. The
  old `api.*` style is retired, not redirected.
- Cache headers belong to the app (it knows what is immutable). Caddy caches
  hashed Vite assets for a year as immutable and gives unhashed `public/` files
  a one-hour default only when the app set no header.
- Deploys are boring on purpose: pinned tags, one command, manual.
- Every image builds with the repository root as its context. The single root
  `.dockerignore` governs what enters a build context; there are no
  per-directory ignore files.
