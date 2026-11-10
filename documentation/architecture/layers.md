# Layers and dependency rules

The system is read in two directions: top-down for responsibilities, bottom-up
for dependencies. This page is the canonical statement of what may depend on
what. The [architecture overview](README.md) shows the deployment shape; the
[subsystem pages](subsystems/README.md) show the internals.

## The dependency rule

Dependencies point inward and downward. A layer may call the layer below it,
never the layer above it, and never sideways into another deployable unit's
implementation.

```text
        ┌──────────────────────────────────────────────┐
        │ 1. Edge                                      │  TLS, routing, exposure
        ├──────────────────────────────────────────────┤
        │ 2. Presentation                              │  routes, components, views
        ├──────────────────────────────────────────────┤
        │ 3. Application / server functions            │  validation, auth, orchestration
        ├──────────────────────────────────────────────┤
        │ 4. Domain and data access                    │  *-data packages, services, repos
        ├──────────────────────────────────────────────┤
        │ 5. Persistent state                          │  PostgreSQL, media files
        └──────────────────────────────────────────────┘

 6. Platform (CI, images, systemd units, Ansible) surrounds every layer.
    It may configure a layer; a layer never reaches up into platform tooling.
```

| Layer | Responsibility | May depend on | Must not depend on | Lives in |
| --- | --- | --- | --- | --- |
| 1. Edge | terminate TLS, route by host, set headers and body limits, keep DNS current | nothing in the app | app internals, database | `infrastructure/caddy`, `ansible/files/dyndns.sh` |
| 2. Presentation | routes, page composition, visual components, client interaction | 3, 4 for types and read models | another site's components, server-only modules from the browser | `web/sites/*/src/{routes,components}`, `web/packages/ui` |
| 3. Application | server functions: authenticate, authorize, validate, choose a transaction, map outcomes | 4, 5 through 4 | routes, React components | `web/sites/*/src/{data,server}`, Studio `server/` |
| 4. Domain and data | workflow rules, transactions, repositories, contracts, service clients | 5 for persistence; other services only over HTTP | presentation, routes | `web/packages/*-data`, `web/packages/{contracts,identity,assets,messaging,queue}`, `services/*` |
| 5. Persistent state | durable rows, constraints, files | nothing | application code | `database/migrations`, PostgreSQL, `/var/lib/apps/media` |
| 6. Platform | build, verify, publish, run, observe | repository configuration | business logic | `.github/`, `infrastructure/units`, `ansible/` |

Two consequences are easy to violate: a component must never import a route,
and Drizzle must never leak outside a `*-data` package. Studio may import a
site's data package; a site may not import Studio.

## Layer 1 - edge

Caddy is the only process reachable from the internet. It terminates TLS with
DNS-01 wildcard certificates, routes by hostname, adds baseline security
headers plus a CSP, applies per-client public and login rate limits, limits
request bodies and sets cache policy for hashed and unhashed static files. It
does not know about content, sessions or the database.

`apps-dyndns.timer` runs independently of request traffic: it updates existing
Infomaniak A records for the managed names. It never creates or deletes records.

There is no host firewall by design. The router forwards only TCP 80/443 and
UDP 51820 (WireGuard); what a unit publishes and which address it binds decide
exposure. Admin interfaces bind to the WireGuard address. See
[edge](subsystems/edge.md).

## Layer 2 - presentation

Each public site owns its routes, components and visual language. Studio owns
the administration views. A site's `src/` is small on purpose:

```text
src/
  components/  visual components named for what they render
  data/        feature reads, mutations and server functions
  model/       public view models and presentation helpers
  routes/      TanStack route definitions and page composition
  server/      runtime infrastructure such as database setup
```

Routes compose components and server functions. Components receive data as
props; they do not query the database and do not import a route. Shared visual
behavior lives in `@oliumbi/ui` only when two real sites need the same stable
behavior.

Studio uses `components/`, `hooks/`, `model/` and `server/`; it has no `data/`
directory. Its `components/content/` and `server/content/` trees group managed
content by site.

## Layer 3 - application and server functions

Server functions are the only place browser input crosses into trusted code.
They validate at the boundary, resolve the actor, check site and capability
authorization, then call a domain service. They return values shaped as
outcomes; expected failures do not escape as raw exceptions.

Public forms share one validation schema between client and server. A form
carries a client-generated submission id; the service checks it in the same
transaction as the write, so a retry returns the original outcome instead of
creating a second row, a second stock decrement or a second email.

Studio server functions call identity for authentication and keep authorization
checks server-side (`requireActor`, ownership checks). A browser is never the
authority on which site or record a user may touch.

## Layer 4 - domain and data access

Each site has a data package (`jublawoma-data`, `unclet-data`,
`zelglihof-data`). A package is organized by feature and role:
`<feature>.repository.ts` for SQL, `<feature>.service.ts` for rules and
transactions, and `content/` for editable record contracts.

Repositories perform database operations only. Services validate inputs, own
transactions, coordinate repositories and enqueue messages. A reservation
stores its product snapshot, adjusts stock and queues notifications in one
transaction. A donation commitment locks the requested item and checks the
remaining quantity. Campaign sending locks the campaign, reads confirmed
subscribers in batches and queues each email individually.

The generic `@oliumbi/database` package contains no site table names; Studio
selects a repository through each site's exported factory. `@oliumbi/contracts`
holds shared validation and site identifiers. The typed clients for identity,
assets and messaging own the HTTP contract of those services.

In the Java services, the internal layering is controller → service →
repository → entity. Controllers translate HTTP; services own rules, locks and
transactions; repositories own queries. Cross-service calls use internal bearer
tokens.

## Layer 5 - persistent state

PostgreSQL is the only durable structured store. Flyway owns the schema,
constraints and roles; Drizzle describes query types and never migrates. Media
originals live under `/var/lib/apps/media` with metadata in PostgreSQL.

The rules that matter at this layer:

- one schema per capability; each app role can write only its own schema;
- checks and uniqueness constraints are the backstop behind request validation;
- timestamps are `timestamptz` in UTC;
- quantities are exact numerics handled as decimal strings, never `float64`;
- prices are display-only `text` until amounts are computed, then exact numerics;
- destructive changes follow expand → backfill → verify → contract once data is live;
- seed data stays out of production migrations.

See [data and schema](subsystems/data-and-schema.md) and
[database/README.md](../../database/README.md).

## Layer 6 - platform

GitHub Actions verifies every change and publishes immutable images on a
version tag. The host runs one systemd unit per workload, rendered from
`infrastructure/units/` by Ansible and pinned to an explicit image tag
(`latest` is rejected). Migrations run as a one-shot unit before the apps, and
Ansible then provisions the application database roles from the vault before
starting them. The maintainer workstation drives the host over WireGuard;
Ansible is the only operational entry point.

This layer configures and observes the others. No application code knows how it
is deployed. See [CI/CD](../development/ci-cd.md) and
[deployment](../operations/deployment.md).

## Request and change flows

### Public page render

1. Browser resolves the hostname; caddy terminates TLS and routes to the site.
2. The site's Nitro server matches a TanStack route.
3. The route's loader/server function reads through the site's data package.
4. PostgreSQL returns only the site's own schema.
5. React renders on the server; the browser hydrates.

### Public form submission

1. The client validates with the shared Zod schema and generates a submission id.
2. The site server function validates again and calls the domain service.
3. The service opens one transaction; it checks the submission id, locks the
   affected stock/capacity row, writes the durable row and inserts a queue
   message.
4. The transaction commits; the response carries a stable reference.
5. A retry with the same submission id returns the same outcome without a
   second write or email.

### Studio write

1. The browser calls a Studio server function with the session cookie.
2. Studio resolves the actor through identity and checks the site/capability.
3. The service validates, applies optimistic concurrency (`updatedAt`), and
   writes only the authorized record.
4. A conflict returns a reload outcome instead of overwriting another edit.

### Image read

1. A page requests `/api/assets/<id>?size=...` on its own origin.
2. The site server function calls the assets service with the internal token.
3. Assets returns the stored rendition with `ETag` and `Cache-Control`.
4. The browser caches or revalidates with a 304.

### Email delivery

1. A site or Studio writes `queue.message` in its business transaction.
2. The messaging worker claims a due row, records an attempt, then sends SMTP.
3. The attempt and the next state commit after the send.
4. Failure retries with backoff; a lease expiry avoids immediate duplicate sends.
   An SMTP success followed by a crash remains inherently ambiguous.

### Change to release

1. A change lands with its tests and documentation.
2. CI runs web checks, Java tests and the deployment-input checks.
3. A version tag makes publish build every image and push `:<tag>`, `:sha-<sha>`
   and `:latest`.
4. The maintainer deploys the tag; migrate runs before apps; rollback is the
   previous tag.

## Cross-cutting rules

| Concern | Rule |
| --- | --- |
| Validation | Validate at every process, browser and provider boundary. Types are not runtime checks. |
| Errors | Expected failures are values (`{ outcome: ... }`) at public boundaries. Java returns problem responses with `errorId`. |
| Identity | Internal service calls use internal bearer tokens. Browser sessions are HTTP-only same-site cookies. |
| Authorization | Server-side per site and capability. Never inferred from the UI. |
| Observability | Structured context and correlation ids; logs never contain secrets, tokens, bodies or personal form data. |
| Configuration | Environment only. Secrets come from the vault; nothing secret is committed. |
| Time | UTC in storage and transport; format for the browser at the edge. |
