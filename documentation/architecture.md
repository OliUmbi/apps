# Architecture

Four public websites and one admin application (Studio) served from a single
server with a single PostgreSQL database. Read this page first, then the
README of the layer you work in. Unfinished work lives in
[open-work.md](open-work.md); the rules behind these choices live in
[principles.md](principles.md) and [decisions.md](decisions.md).

## Drivers

Low traffic, one maintainer, four distinct sites, private administration,
durable data. The repository is shared for discovery and coordinated change;
each site application is independently buildable and deployable; capabilities
have explicit ownership and contracts; a capability becomes its own process
only when that makes the whole system simpler or safer.

## Layers

```
 Internet
    │
    ▼
 ┌─ edge ──────────────────────────────────────────┐
 │ caddy    TLS (DNS-01 wildcards), host routing,  │
 │          security headers   [infrastructure/]   │
 │ dyndns   timer keeps Infomaniak A records here  │
 └────┬────────────────────────────────────────────┘
      │
 ┌─ web/ ──────────────────────────────────────────┐
 │ TanStack Start (React, Vite, Nitro), SSR on Node│
 │ jublawoma :8001    unclet :8002   zelglihof:8003│
 │ studio    :8000  (admin for all sites)          │
 └────┬────────────────────────────────────────────┘
      │
 ┌─ services/ ─────────────────────────────────────┐
 │ Spring Boot, internal network only              │
 │ identity :8081   messaging :8082   assets :8083 │
 └────┬────────────────────────────────────────────┘
      │
 ┌─ data ──────────────────────────────────────────┐
 │ postgres 18 · one database · one role per app   │
 │ volumes: assets-data (/media), caddy-data (TLS) │
 └─────────────────────────────────────────────────┘
```

## Components

| Component | Purpose | Owns |
| --- | --- | --- |
| caddy | TLS via DNS-01 (Infomaniak), hostname → service routing, security headers, body limit | certificates in `caddy-data` |
| dyndns | systemd timer: keeps the Infomaniak A records on the dynamic IP, same API token as caddy | — |
| sites (jublawoma, unclet, zelglihof) | Public SSR websites; own their routes, content tables and forms | their schema |
| studio | Admin UI for all sites; one hostname so sessions survive | — |
| identity | Accounts, sessions, permissions | account schema |
| messaging | Email queue, delivery, SMTP outbox | communication schema |
| assets | Image/document storage, size variants | media schema + `/media` volume |
| postgres | The one database; each app has its own role and schema | everything |
| migrate | Flyway, runs before the apps on every deploy | `database/migrations` |

## Key flows

- **Page request** — browser → caddy (TLS, route by host) → site SSR →
  postgres. Sites read their own schema directly; cross-app data goes through
  services.
- **Public image** — page requests `/api/assets/<id>?size=…` → site server
  function → assets service → browser gets the image with the `Cache-Control`
  and `ETag` the assets service set (304s supported).
- **Upload** — studio → assets service → `assets-data` volume, metadata in
  postgres.
- **Email** — site or studio server function → messaging (queued) → SMTP.

Services authenticate each other with `*_INTERNAL_AUTHORIZATION_TOKEN` values
from the environment. Only caddy is reachable from the internet.

## Boundaries and data ownership

**When to split a service**: a different failure or release lifecycle, a
materially different security boundary, background work unsuitable for HTTP, a
language with concrete benefit, or a shared need that would otherwise couple
databases. Never split just to mirror a folder — every service adds contracts,
deployment order, networking, observability and failure modes.

**Contracts**: validate everything crossing a boundary (request, environment
value, provider response, stored payload); use stable identifiers, not database
row shapes; return structured outcomes, never parseable messages; carry a
correlation id through proxy, site, services and jobs; design writes for
duplicate delivery; version breaking process-boundary contracts explicitly.

**Data**: one PostgreSQL server does not mean one access model. Each owner gets
a role with only the permissions it needs and only the owning capability writes
its tables (others use a contract or a reviewed view). A migration belongs to
the unit that owns its model and runs before the code needing it; destructive
changes use expand → backfill → verify → contract. `timestamptz` in UTC,
exact numerics for money, constraints and deletion behavior as part of the
domain model, seed data outside production migrations.

## Environments

| | development | production |
| --- | --- | --- |
| compose | `infrastructure/compose.dev.yaml` | `infrastructure/compose.prod.yaml` |
| config | root `.env` (gitignored; template `infrastructure/.env.dev`) | `/apps/.env` from the vault (template `infrastructure/.env.prod`) |
| images | built locally | `ghcr.io/oliumbi/apps-*` pinned by `IMAGE_TAG` |
| migrations | bind mount, edited in place | baked into `apps-migrate:<tag>` |
| email | mailpit | real SMTP |
| TLS | none | caddy, DNS-01 wildcards |

## Deployments

`.github/workflows/publish.yml` builds every image on a version tag and pushes
`:<tag>`, `:sha-<sha>` and `:latest`. Deploy is
`IMAGE_TAG=<tag> docker compose up -d` on the server; rollback is the same
command with the previous tag. `migrate` runs first and the apps wait for it.
Today the legacy stack (`legacy/`) is still live; cutover is tracked in
[open-work.md](open-work.md).

## Repository map

| path | content |
| --- | --- |
| `web/` | TanStack Start sites + shared packages (pnpm) — [web/README.md](../web/README.md) |
| `services/` | Spring Boot services + shared module (maven) — [services/README.md](../services/README.md) |
| `database/` | Flyway migrations, schema source of truth — [database/README.md](../database/README.md) |
| `infrastructure/` | prod compose, monitoring, Caddyfile, env template |
| `ansible/` | the ops interface: server setup, deploy, backup, housekeeping |
| `documentation/` | principles, architecture, sites, migration, operations, decisions, open work |
| `legacy/` | the currently running old stack, read-only reference |

## Conventions

- Configuration is environment only; secrets never enter git (`.env` is
  ignored, values live in the ansible vault).
- Each app owns its schema; no cross-app SQL. Shared behaviour lives in the
  shared packages/modules, never in another site's code.
- Ports: sites `8000–8003`, services `8081–8083`. Nothing else is published.
- Public hostnames are defined in one place, `infrastructure/caddy/Caddyfile`:
  `jublawoma.ch`, `uncle-t.ch`, `zelglihof-maegenwil.ch`, `studio.oliumbi.ch`; other
  `admin.*`/`studio.*`/`www.*` names redirect. The old `api.*` style is
  retired, not redirected.
- Cache headers belong to the app (it knows what is immutable); caddy only
  sets a modest default for static files.
- Deploys are boring on purpose: pinned tags, one command, manual.

Operations (access, logging, backups, housekeeping, monitoring) are documented
in [operations.md](operations.md).
