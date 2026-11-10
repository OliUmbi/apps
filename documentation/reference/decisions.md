# Decisions

How we do things, in one place. Not an ADR archive: the maintainer is the main
developer, so direction and consequence matter more than rationale. Write a full
decision record only when someone outside the project needs the context.

Use this page for adopted direction. Open questions stay here with an `O-*`
number until decided. Actionable work and debt live in
[open work](../work/open-work.md) and [technical debt](../work/tech-debt.md).

Status legend: **C** = fixed direction, **P** = approved proposal, **O** = a
question (closed or open), **D** = decision adopted for a specific execution
pass. A horizontal change to a direction is a new decision that supersedes the
old one; do not silently rewrite history.

## Fixed directions

| # | Direction | Consequence |
| --- | --- | --- |
| C-001 | One repository for the whole portfolio. | Shared tooling and discovery; no implied runtime coupling. |
| C-002 | Separate site applications replace the hostname-switched legacy SPA. | Own build, routes, image, release and rollback per site. |
| C-003 | TanStack Start for web applications. | Follow the framework; do not wrap it. |
| C-004 | PostgreSQL as the datastore. | Migrations, ownership, backup and restore designed before durable data. |
| C-005 | One Linux host. (2026-11: Docker Compose replaced by podman/Quadlet systemd units — see the deployment migration below.) | Health checks, private networks, durable state, pinned images. |
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
| O-006 | **Ratified 2026-11.** Local password accounts: identity stores only BCrypt hashes, session tokens are random 256-bit values stored as SHA-256 hashes, and services use internal bearer tokens from the environment. Sessions last seven days and are revoked server-side on password change or account disable. No MFA, recovery or invitations until public accounts exist. The first administrator is a one-time Ansible playbook (`ansible/playbooks/first-admin.yml`), never a migration seed. Threat model under [launch decisions](#launch-decisions-2026-11). |
| O-007 | Content is site-specific and custom-built; explicitly not a generic CMS. Scope in [sites](sites.md). |
| O-008 | Private server, media on disk, no CDN; reasonable default limits; revisit when relevant. |
| O-009 | Email via SMTP from the domain provider, deliberately simple now. Two mail identities per domain: a **requests** inbox (`hof@`, `info@`, `scharleitung@`) for form notifications and Reply-To, and a **newsletter@** sending identity for subscriber mail — separated so bulk mail cannot damage the deliverability of confirmations, and replies still reach a human. Strategy reviewed later. |
| O-010 | **Ratified 2026-11.** Flyway owns schema and constraints; migrations live in `database/migrations`; one schema per capability as defined in V001. Pre-launch migration files are edited in place and the local database is recreated. Freeze the baseline at the first accepted production import; afterwards use expand → backfill → verify → contract. The one-shot migrator runs before the apps on every deploy, so no two migrators race. |
| O-011 | Requirements were low (monthly backups, up to a day to recover); now superseded: daily backups, pull to workstation, restore drills ([operations](../operations/README.md)). |
| O-012 | Low availability requirements; now superseded: monitoring + alerting exist ([operations](../operations/README.md)). |
| O-013 | Superseded: certbot/nginx plan replaced by containerized Caddy with DNS-01 wildcards; dynamic DNS handled by a server-side timer. |
| O-014 | Stability requirements low; beta versions acceptable; periodic upgrades without formal policy. |
| O-015 | German-only for the three client sites, Oliumbi mainly English; **German public paths** via Paraglide `urlPatterns` with English route files (2026-11, D32); Paraglide for i18n; dates via a proper library, formatted per browser locale. |
| O-016 | No analytics; minimal third-party embeds. Instagram is an explicit requirement (Uncle-T, Jublawoma); review better embedding options. |
| O-017 | Owner confirmation is easy; small data sets may be migrated by hand. |

## Operations decisions (2026-10)

- Caddy in a container, DNS-01 wildcards through Infomaniak; one API token
  covers certificates and the dyndns timer that keeps A records on the dynamic
  IP.
- No host firewall: the router forwards (80/443 + WireGuard) are the boundary;
  what the units publish and where they bind decides exposure.
- Recurring work (backup, housekeeping, dyndns) runs as systemd timers on the
  server, installed and triggered by Ansible over WireGuard. SSH is never
  public.
- Backups: daily `pg_dump` + media tarball, `age`-encrypted, three rotating
  copies on the server, pulled to the workstation; restore drill on a
  dedicated machine (deferred, see below).
- Alerts: prometheus rules → alertmanager → ntfy topic to the phone.
- Deployments are manual and pinned by image tag; `latest` is never the
  deployment source. Rollback is deploying the previous tag.
- Server layout: units in `/etc/containers/systemd`, monitoring config in
  `/apps`, durable state in `/var/lib/apps`; secrets come from the ansible
  vault and never enter git.

## Deployment migration (2026-11)

Adopted to move the server off Docker Engine ([deployment plan](../history/deployment-plan.md)):

- **D11 — Podman + Quadlet replaces Docker Compose on the server.** Every
  workload is a systemd unit (`apps-*.service`, from `infrastructure/units/`),
  installed by Ansible like the timer units. No container daemon, no compose
  on the server; container names keep the service DNS names so the Caddyfile
  and monitoring configs are unchanged. Secrets are per-service
  `EnvironmentFile=/etc/default/apps-<service>` (0600 root). Docker Desktop +
  `compose.dev.yaml` remain the local development rig and are deliberately
  not a mirror of production.
- **D12 — Backed-up state lives in plain directories** under `/var/lib/apps/`
  (`postgres`, `media`, `caddy`); backup and restore are `pg_dump` and `tar`.
  Monitoring state stays on named volumes and is not backed up. *(2026-11 note:
  the nightly `backup.sh` archives database and media only; Caddy's ACME state is
  deliberately excluded and re-issued — see D21 and
  [TD-16](../work/tech-debt.md#td-16).)*
- **D13 — Deploy stays manual and pinned by image tag.** Ansible renders the
  units with the tag, pulls, and restarts the stack in dependency order
  (postgres → migrate → apps → caddy). Rollback is the previous tag.
- **D14 — The restore drill uses a dedicated machine**: rebuild from zero,
  restore a backup, walk every site. The workstation drill is retired with the
  compose files. *(2026-11 execution clarification: use the not-yet-live
  replacement host after an import rehearsal while legacy remains live; the
  drill remains open in [open work](../work/open-work.md).)*
- **D15 — cAdvisor is dropped** (docker-coupled); node-exporter's systemd
  collector plus blackbox cover the host and the apps. *(2026-11: the
  node-exporter unit now enables the systemd collector and mounts host dbus and
  `/run/systemd`; verify the series and alerts on the real host — RV-01.)*
- **D16 — Legacy migration is manual and owner-led.** The owner will migrate the
  small data set by hand; no importer will be built. A sanitized rehearsal,
  explicit mappings, disabled historical notifications and source/migrated/
  skipped/failed plus media reconciliation are still required. The committed
  legacy credential values were placeholders and are already handled, so no
  legacy rotation task remains; production still uses only unique vault secrets.
- **D17 — The pre-launch Flyway baseline stays consolidated.** Owning migration
  files are edited in place until the first accepted production import, and local
  volumes may be rebuilt from zero. The current head is V012: V006 is Studio
  (with the audit history), V007 is reserved for Oliumbi, V008 Jublawoma,
  V009 Uncle-T and V010 Zelglihof, V011 analytics and V012 the monitoring role;
  the Oliumbi schema/role stays reserved in V001. Submission
  idempotency lives in V008–V010 with the tables it protects. Once live data
  exists, new changes are append-only expand/contract migrations.

Also closed: the Zelglihof domain is `zelglihof-maegenwil.ch` (the application
code had it right; documentation and infrastructure did not).

## Launch decisions (2026-11)

Adopted for the first go-live pass. These close the remaining contract questions
and set the recovery and cutover boundaries.

- **D18 — Archive-only lifecycle.** Products, variants and reservations are never
  hard-deleted. Products and variants carry `archived_at`/`archived_by`; public
  reads hide archived rows while reservation history keeps its references.
  Reservations are cancelled only through an explicit, one-time transition from
  `new`/`in-progress`, with guarded stock restoration and
  `cancelled_at`/`cancelled_by`/`cancellation_reason`/`stock_restored`. Queued
  campaigns are irreversible; only drafts are deletable. Consequence: no delete
  action destroys history or restores stock twice.
- **D19 — Campaigns are bounded at 500 active recipients.** A larger send is
  refused with the typed `too-large` outcome before anything is queued; the
  campaign stays a draft. Consequence: one run cannot hold a transaction across
  an unbounded audience.
- **D20 — Unsubscribe tokens stay plaintext for launch.** The token is an
  unguessable per-subscriber value and the endpoint is idempotent; raw tokens
  also appear in queued message bodies, so hashing the column alone would not
  remove the exposure. This is a low-severity integrity risk (a leaked
  queue/body copy could unsubscribe one address), accepted for the launch data
  set. Compensating controls: HTTPS-only delivery, no personal data beyond the
  subscriber address, a single-purpose endpoint, hashed confirmation tokens and
  seven-day sessions. Revisit when newsletter volume or public accounts grow.
- **D21 — Caddy's ACME state is excluded from backup and re-issued.** Backups
  cover database and media only. A rebuilt host re-issues through DNS-01 with
  `vault_infomaniak_api_token` and `vault_acme_email`; `CertificateExpiringSoon`
  alerts 14 days ahead, and re-issuance is verified in the restore drill.
  Consequence: recovery depends on the vault DNS token, not on a copied
  certificate store.
- **D22 — Edge rate limiting and a baseline CSP are implemented.** Caddy applies
  a per-client-IP public zone (20 events per 2s, IPv6 grouped by /64) and a
  stricter login zone (10/min); a baseline Content-Security-Policy ships with
  the shared site headers. Consequence: abuse resistance sits at the edge before
  application logic, and new embeds must fit the policy.
- **D23 — The cutover point of no return is the first durable public write.**
  Before that write, routing may return to legacy. After it, rollback must
  export/replay the new writes or roll forward; a DNS-only switch back is not
  data-safe. The observation window and owner sign-off decide when the point is
  crossed.
- **D24 — Base/tool images are pinned `tag@digest` and refreshed monthly.**
  Dockerfile `FROM` lines, CI container images and publish action SHAs pin
  exact bytes (DR-14); a digest change is always a deliberate, reviewable
  commit, so builds stay reproducible and rollback targets known bytes.
  Runtime CVE fixes (Caddy, Node, temurin) arrive as new version tags and stay
  deliberate bumps; the monthly refresh in
  [open work](../work/open-work.md) picks up silent base (alpine) rebuild
  fixes. Floating tags were considered and declined (2026-11): without a
  scheduled rebuild pipeline they would not deliver base fixes faster, and
  they lose the reproducibility DR-14 exists for. Industry consensus (Kubernetes,
  Chainguard, Renovate, Docker) is pin + automated refresh; if the manual
  cadence slips, Renovate-style digest automation is the prepared alternative.
- **D25 — Analytics are anonymous, first-party and aggregate.** Each site sends
  one route-id beacon per resolved navigation (no URL, cookie, address,
  referrer or visitor identifier) and counts into `analytics.view_daily`, one
  row per site, day and route template. Bot and no-JS traffic is not counted.
  Studio shows a per-site 30-day total, top routes and a daily series. No
  consent banner is needed because the counters carry no personal data. All
  three German sites are tracked; each privacy page states the anonymous
  counting inline, including Jublawoma (the external PDF is unchanged). Oliumbi
  has no database and is excluded until it has one.
- **D26 — The audit trail is append-only, admin-only and narrow.** Studio
  records destructive and administrative actions (accounts, permissions, asset
  visibility/deletion, product/variant archival, reservation changes and
  cancellation, inquiry/review status, campaign send, subscriber changes) in
  `studio.audit_event` with actor, site, action and entity. No before/after
  values and no message bodies. The application role cannot update or delete
  rows; 18-month retention runs in housekeeping. A site role cannot read the
  trail.
- **D27 — Operational retention is age-based and never touches product data.**
  Delivery history ages out after 12 months, inbox rows after 30 days, audit
  events after 18 months and analytics counters after 25 months. Inquiries,
  reservations, subscribers and donations are never deleted by housekeeping.
  The current shell job is an interim; it moves into a service-owned scheduled
  job if the policy grows ([TD-22](../work/tech-debt.md#td-22)).
- **D28 — A subscriber address correction keeps the consent chain intact.** The
  Studio correction is allowed, but a pending or active subscriber returns to
  pending with a confirmation email to the new address; an unsubscribed record
  stays unsubscribed; an address owned by another subscriber is a conflict; and
  saving the stored address is a no-op. Consequence: Studio can invite an
  address, never subscribe it silently.
- **D29 — Observability is metric-first and bounded.** Identity, messaging and
  assets expose Micrometer/Prometheus on the private network; Caddy exposes
  edge request/latency/status metrics on its internal admin listener;
  postgres_exporter runs as a read-only `monitoring` role (`pg_monitor`).
  Alerts cover absence as well as thresholds: a disappeared probe series, a
  failing TLS probe, a service that stops exposing metrics, edge and service 5xx
  ratios, pool and connection saturation, queue age and terminal message
  failures. Dashboards stay manual, logs stay journald, and page analytics is
  not a Prometheus workload. Consequence: a silent monitor is treated as an
  incident, not as reassurance.
- **D30 — Delivery is at-least-once with an explicit batch/lease budget.**
  The worker sends at most 10 messages per batch against three five-second SMTP
  timeouts (150 s) inside a ten-minute lease, and shuts down gracefully with a
  60 s stop timeout. A crash after SMTP accepted a message can still duplicate
  it; that is accepted, and there is no manual retry endpoint. A failed campaign
  email remains visible in Studio but is not resent without a new campaign.
- **D31 — The backup key survives the workstation.** The server holds only the
  public `age` recipient. The private identity is passphrase-wrapped, kept in
  the password manager and printed with its passphrase and the restore commands
  on one recovery sheet. A lost workstation is recoverable from the sheet; a
  lost sheet means a new key and a fresh archive. The drill restores from the
  printed copy, not the password manager.
- **D32 — Public URLs are German; route files stay English.** `urlPatterns` in
  the Paraglide compiler options map `/about` to `/ueber-uns` and so on; the
  router's existing input/output rewrite applies them, so links and navigation
  keep using the type-safe English route ids. Sitemaps use the German paths.
  System endpoints (`/api/*`, newsletter tokens) are never localized. A missing
  pattern fails the `i18n-urls` test.

### O-006 threat model (accepted 2026-11)

Fewer than ten known users, one origin and no public registration. Session
cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` with the `__Host-` prefix in
production. There is no separate CSRF token: `SameSite=Lax` blocks cross-site
form posts and every Studio handler re-checks the actor server-side; that
residual risk is accepted at this scale. Login is rate-limited at the proxy
(10/min per IP); internal service calls use bearer tokens from the environment
and never reach the browser. Passwords are BCrypt hashes; session and
confirmation tokens are stored as SHA-256 hashes. Accepted for launch: no MFA,
no recovery flow, no per-device session list and no CSRF token.

## Adopted for the 2026-10 refactoring pass

Adopted to unblock the refactoring pass
([refactoring plan](../history/refactoring-plan.md) §1). These are
adopted-by-refactor decisions, not long-term ratifications: review them here
after the pass.

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
  change with the zelglihof data package and is deferred; tracked as
  [TD-15](../work/tech-debt.md#td-15).
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
Router + TanStack Query, Vite + Nitro (Node 26), Tailwind 4, Base UI, Lucide,
Biome; Spring Boot (Java) services with actuator; PostgreSQL 18 with Flyway
migrations; Caddy; podman/Quadlet systemd units on the server (Docker Compose
for local development); GitHub Actions.
