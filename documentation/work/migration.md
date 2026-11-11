# Migration

How the legacy system is replaced. Incremental and reversible: one site can
launch without moving another, one content type can be reconciled before
dependent workflows, one version can roll back without a schema rollback. The
production system stays authoritative until a feature's cutover is complete;
`legacy/` is read-only reference material.

**Current position (2026-11).** The legacy stack is still live and authoritative.
The replacement exists and passes its local gates, but no site has been cut over.
Oliumbi is now a static placeholder on `:8004` with its apex route, so it is no
longer a missing site. The complete launch gate includes deployment/bootstrap,
application P1 debt, restore and import rehearsals, and content/legal approval;
see [open work](open-work.md) and the
[remediation plan](go-live-remediation-plan.md). Migrations end at V011 (V008
Jublawoma, V009 Uncle-T, V010 Zelglihof and V011 analytics; the monitoring role
is in V001); V007 is intentionally unused, and the old empty Oliumbi placeholder
migration is removed with its schema/role reserved in V001. Deploy mechanics are
in [deployment](../operations/deployment.md); the cutover sequence is below.

## Phases

1. **Decide and inventory** — record the remaining decisions ([decisions](../reference/decisions.md)); inventory legacy routes, tables, accounts, files, forms and integrations; mark each item **migrate / replace / archive / drop** with owner approval; capture a sanitized database + media fixture for rehearsal.
2. **Vertical slice: Zelglihof** — one complete, operable site: real content, one durable submission workflow end to end, the editing the owner actually needs, sessions and site-scoped authorization, and the full deploy/proxy/backup/CI path. Exit: launch checklist met, clean environment builds from source + migrations, restore and rollback rehearsed.
3. **Shared migration capabilities** — publication/archive/revision behavior, media import with deterministic derivatives, editor management, the owner-led manual mapping and reconciliation checklist (D16), and redirect/sitemap conventions.
4. **First legacy site (Uncle-T first: lower scope and risk)** — build against sanitized data, rehearse imports repeatedly, owner acceptance in a production-like environment, then freeze writes briefly, final export/import/reconcile, cut over with monitoring and a rollback window, keep legacy protected until acceptance.
5. **Second legacy site (Jublawoma)** — reuse proven contracts, not the first site's page components. Decide articles, events, documents, donations, points and youth-privacy handling.
6. **Oliumbi and experiments** — the static placeholder operates at the apex; real content is post-launch. Experiments get explicit boundaries so they cannot destabilize client sites.
7. **Retire legacy** — all domains and consumers on the replacement, reconciliation reports accepted, redirect/access-log review clean, final encrypted archives created and restore-tested, retention dates recorded, observation window stable, rollback independent of the old stack. Then decommission containers, credentials, DNS records and volumes; remove `legacy/` only once its useful knowledge lives here.

## Data migration method

Use the [owner-led manual migration checklist](manual-migration-checklist.md)
(D16); no importer will be built. The replacement schema is at the V011 baseline
until the first accepted production import freezes it.

- **Discover**: row counts, invalid references, status values, duplicates,
  timestamps, encodings, orphaned media; identify personal data.
- **Extract**: read-only production role; timestamped, checksummed export with
  schema version and counts; media manifest with hash and target relation. No
  real production data in ordinary dev environments.
- **Transform and load**: the owner migrates the small data set by hand (D16),
  using a repeatable checklist into a clean target rather than an importer.
  Preserve source ids in a mapping report; use explicit status mapping that
  reports unknowns, validated payloads and transactions sized for useful
  rollback; never send real email during rehearsal.
- **Reconcile**: compare source/migrated/skipped/failed counts and media hashes;
  sample-check long content, Unicode, missing images, drafts, future dates and
  deleted states with the owner; crawl migrated routes; store the signed-off
  report with the release.

## URL and SEO rules

Preserve valuable URLs; one-hop permanent redirects for renames; never redirect
everything to the home page; real 404/410 for intentionally removed content;
consistent canonical host/protocol/trailing-slash; per-site sitemaps and robots;
verify titles, previews and language; watch crawl errors and high-volume legacy
paths after cutover.

## Cutover playbook

One week ahead: owner, date, impact, communication, backups, migration build and
rollback criteria agreed. Then:

1. confirm current backups restore-readably; record old and new artifact ids;
2. lower DNS TTL if DNS changes;
3. enable the write freeze;
4. run the final migration and reconciliation;
5. deploy database-compatible application versions;
6. internal and external smoke tests;
7. switch proxy routing or DNS, then explicitly enable live dyndns
   (`-e dyndns_enabled=true`). Before this run the timer is installed but stopped,
   so a parallel host cannot change live records;
8. verify TLS, redirects, forms, login, admin permissions, media, logs, health
   and message delivery;
9. owner runs a short acceptance script and records the first durable public
   write (the point of no return);
10. observe closely for the agreed window; the owner signs off before legacy is
    retired.

Rollback triggers are objective: inaccessible primary routes, lost or corrupt
submissions, unsafe authorization, broken admin workflow, invalid TLS, or error
rate above threshold. Roll back application/routing to a schema-compatible
version; down-migrations are never the default recovery.

**Cutover data gap (RV-04):** routing back to legacy after the replacement has
accepted writes can strand those submissions on the new database. Before public
forms open, define the point of no return and the new-write export/replay or
roll-forward procedure. The first durable public write is that point (D23). After
it, a DNS rollback alone is not a data-safe rollback: export/replay the accepted
writes or roll forward, and keep the owner's sign-off and observation window in
the record.

## Roadmap rules

Complete one operable vertical slice before broad platform extraction. Every
milestone includes tests, operations, documentation and owner acceptance.
Prefer removing scope over weakening data integrity, security or recovery. A
technology experiment has an exit question and cannot block the critical path
without an accepted decision. Track deferred work by user impact and risk, not
as a flat list of technical TODOs. Review the roadmap after each launch.

## Deferred on purpose

Staging environments and end-to-end suites are overkill at this scale for now —
kept on the plan to revisit ([open work](open-work.md)).
