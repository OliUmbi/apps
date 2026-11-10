# First go-live remediation plan

**Status:** IN PROGRESS, 2026-11-09. The code packages (G0-A to G0-D) are
complete; no package is acceptance-complete without real-host, DNS, SMTP, backup
or restore evidence.
**Context:** `legacy/` is the currently deployed and authoritative system. The
replacement will boot on a clean host for its first go-live. Keep legacy running
and untouched until the rehearsed cutover; do not develop in `legacy/`.

This plan sequences the existing launch gate, DR/TD items and the 2026-11
[first go-live review](../history/go-live-review-2026-11.md). The live registers
remain the issue checklist; this file owns sequencing, package boundaries and
acceptance evidence.

## Review baseline

Reviewed commit `2fc721d` and the maintained documentation, deployment inputs,
identity/Studio paths, data contracts and migration tooling.

- `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm build` and the additional
  Studio build passed locally. `STUDIO_TEST_ADMIN_URL` was unset, so the two
  PostgreSQL-gated web suites did not run locally; CI must provide that evidence.
- `services\mvnw.cmd -f services/pom.xml test` passed. One assets test skipped
  because a Windows symlink could not be created. Java has no real-PostgreSQL
  integration suite (TD-13).
- `docker compose -f infrastructure/compose.dev.yaml --env-file
  infrastructure/.env.dev config` passed.
- 265 relative links in 39 maintained documents resolve. Frozen history was not
  treated as current instructions.
- No remote CI run, deployed host, DNS, SMTP, backup pull or restore was
  exercised. Green local gates are not production readiness.

*2026-11 update: the Windows junction tests now pass where the host can create a
junction, Checkstyle runs in `mvn test`, and the migration head is V012. No
remote/real-host evidence has been produced yet.*

## New review findings

| ID | Finding | Required disposition |
| --- | --- | --- |
| RV-01 | `UnitFailing` and `UnitRestartLoop` use node-exporter systemd metrics, but `apps-node-exporter.container` does not enable or wire the host systemd collector. The alerts can silently have no data. | Enable and wire host systemd access, verify the metric series on the real host, and fire both alerts as a test. |
| RV-02 | `BackupStale` has no `absent()` branch, so a host with no first backup metric has no stale-backup alert. The textfile is also written in place instead of atomically. | Alert on missing as well as old metrics; write a temporary file and rename it atomically; test before the first backup and after a failed backup. |
| RV-03 | `site.yml` enables dyndns immediately for the live production names. A parallel clean host can therefore change live DNS before cutover. | Add an explicit pre-cutover mode that cannot update live records. Enable live updates only in the cutover package. |
| RV-04 | The cutover playbook does not define how writes accepted by the new system are preserved if traffic rolls back to legacy. | Define the point of no return and an export/replay or roll-forward procedure for post-cutover writes before enabling public forms. |

TD-14 is now explicitly owner-led: the owner will migrate the small data set by
hand (D16), so no importer will be built. Manual mapping and reconciliation are
still launch evidence. DR-15 through DR-20 are now in `open-work.md`; they must
not live only in frozen review evidence.

## Non-negotiable go-live controls

1. Legacy remains authoritative until final cutover acceptance.
2. Router forwarding and live DNS stay on legacy during new-host rehearsals.
3. Use only unique production secrets from the vault. The committed legacy
   values were placeholders and are already handled, so no legacy rotation task
   remains.
4. O-006 and O-010 are ratified (2026-11). The local-account model (BCrypt
   password hashes, hashed session tokens, internal bearer tokens) and the
   Flyway/schema-per-capability model are the baseline; do not change course
   after live data exists without a new decision.
5. Pre-launch migrations may be edited in place only until the first accepted
   production import. The current head is V012 (V007 reserved for Oliumbi,
   V008 Jublawoma, V009 Uncle-T, V010 Zelglihof, V011 analytics and V012
   monitoring role); the empty Oliumbi placeholder migration is removed and its
   schema/role stays reserved in V001. Tag that baseline; afterwards use
   append-only expand/backfill/verify/contract migrations.
6. Do not retire legacy until reconciliation, the observation window, final
   encrypted archives and restore evidence are accepted.
7. The cutover point of no return is the first durable public write. Before it,
   routing may return to legacy; after it, export/replay the new writes or roll
   forward, never a DNS-only rollback (D23/RV-04).

## Packages and exclusive file ownership

Packages are sequential unless their entry says otherwise. A package may write
only its listed paths. External/owner actions are listed as acceptance inputs,
not excuses to edit another package. Shared review findings are coordinated at
the package boundary named in their row above.

| ID | Scope and owned paths | Depends on |
| --- | --- | --- |
| G0-A | Legacy safety, decisions and cutover control. `documentation/work/**` except `migration.md` and `manual-migration-checklist.md`, `documentation/history/**`, `documentation/reference/decisions.md`, `documentation/operations/{access-and-security,deployment,releases,runbooks}.md`, `ansible/playbooks/site.yml`, `ansible/roles/dyndns/**`, `ansible/files/{dyndns.sh,apps-dyndns.service,apps-dyndns.timer}`. | Owner availability for decisions; the legacy exposure check can start now. |
| G0-B | Reproducible build, clean-host bootstrap, identity bootstrap, edge and monitoring. `.github/**`, `ansible/**` except the paths owned by G0-A/G0-C, `infrastructure/**`, every `Dockerfile`, `documentation/operations/monitoring.md`, `infrastructure/README.md`, `ansible/README.md`. | G0-A pre-cutover mode; published image contract for first boot. |
| G0-C | Backup, housekeeping and restore. `ansible/files/{backup.sh,housekeep.sh,pull-backups.ps1,pull-backups.sh,apps-backup.service,apps-backup.timer,apps-housekeep.service,apps-housekeep.timer}`, `ansible/roles/{backup,housekeep,restore}/**`, `ansible/playbooks/{backup,housekeep,restore}.yml`, `documentation/operations/{backup-restore,housekeeping}.md`. | G0-B host shape for code; G0-D/G0-E for the data-bearing drill. |
| G0-D | Application and data correctness. `database/migrations/**`, `database/README.md`, `services/**` except Dockerfiles, `web/packages/**` except `i18n/messages/**`, `web/sites/studio/**`, `web/tests/**`, `documentation/architecture/subsystems/**` except `web-apps.md`. | G0-A decisions for TD-08/TD-15; coordinates service contracts with G0-B. |
| G0-E | Owner-led manual migration and reconciliation. `documentation/work/migration.md` and `documentation/work/manual-migration-checklist.md`. Legacy source data is read-only and no personal data enters these documents. No importer or `database/import/` tree will be created. | G0-D stable schema; sanitized legacy extract; owner-approved mappings and manual execution. |
| G0-F | Public-site content, accessibility, SEO and final acceptance. `web/sites/{jublawoma,unclet,zelglihof}/**` except Dockerfiles, `web/packages/i18n/messages/**`, `web/README.md`, `documentation/development/**`, `documentation/architecture/{README.md,layers.md,subsystems/web-apps.md}`, `documentation/reference/{sites.md,glossary.md}`. | Owner content/legal decisions; final gate depends on G0-B/G0-C/G0-D/G0-E. |

## Execution

### G0-A — Protect legacy and make cutover explicit

1. Externally verify that legacy ports 5432/8080/8000 are not reachable; do not
   wait for the rebuild to do this. The owner confirmed the committed legacy
   credential values were placeholders and are already handled.
2. Resolve O-006, including a short threat model and the first-admin procedure.
   Resolve O-010 and record when the migration baseline becomes append-only.
   Resolve TD-08 and TD-15 far enough for G0-D to implement safe contracts.
3. Implement RV-03: pre-cutover is the safe default for a parallel host; live
   dyndns requires an explicit cutover action. Keep the router on legacy.
4. Add RV-04 to the cutover runbook: no ambiguous “roll back DNS” after the new
   system has accepted durable writes. Include legacy final-export and new-write
   replay procedures and an observation-window owner.
5. Reconcile the work registers whenever a package lands; keep DR/TD/RV IDs.
   The G0-A coordinator appends source dispositions on behalf of every package
   without rewriting frozen evidence.

**Exit:** legacy exposure is closed; O-006/O-010 and lifecycle/token contracts
are decided; a clean host cannot change live DNS inadvertently; the cutover and
post-write rollback policy is signed off.

### G0-B — Make a clean host boot, deploy and observe itself

Land in this order:

1. **Release inputs:** DR-06, DR-11, DR-13 and DR-14. Require an explicit
   non-`latest` tag; keep passwords out of URLs and safely render/log secrets;
   build every image without pushing in CI; pin base/tool images, the Caddy
   plugin, actions and the CI Ansible package. Add negative tests for missing or
   `latest` tags and special-character credentials.
2. **Fresh bootstrap:** DR-04, DR-07 and O-006. After `apps-migrate` and before
   applications start, provision each `NOLOGIN` role from the vault with safely
   bound SQL values. Smoke-test one connection per role. Create the DNS records
   without switching live traffic. Add a one-time, `no_log`, audited first-admin
   playbook using identity's authenticated internal endpoint; grant the minimum
   required permission and require a unique password, never a migration seed.
3. **Deployment behavior:** DR-10, DR-12, DR-15, DR-16 and DR-19. Apply
   monitoring unit/env changes, align Studio upload limits with 20 MiB images and
   50 MiB PDFs, install/verify sudo, order WireGuard-bound units and make SSH
   restriction reversible. DR-17 belongs to G0-C's timer files.
4. **Monitoring:** DR-05, DR-18, DR-20, RV-01 and the alert half of RV-02. Make
   configs readable only by the intended users while keeping the webhook narrow;
   verify NAT-hairpin behavior or use an internal probe; provision dashboards or
   stop claiming they are provisioned. Prove systemd metrics exist and a real
   alert/recovery reaches the phone. Add external uptime and dead-man coverage
   before final acceptance.
5. **Edge security:** TD-01, TD-02 and TD-03. Caddy rate limiting is in place
   (public 20 events/2s per IP, login 10/min, IPv6 /64 grouping) and a baseline
   CSP ships with the shared headers. Static assets are cached by hash. Verify
   the header and a 429 response on the real host.

**Exit:** from an empty host, one pinned command provisions roles and starts
every unit, and the one-time first-admin playbook then creates the
administrator; only Caddy is public; secure cookies work; all running image tags
match the request; monitoring has real series and tested alerts; valid uploads
pass; repeated bootstrap is idempotent and leaks no secret.

### G0-C — Prove backup and restore before trusting them

1. Finish DR-08: the outer archive is written to a file, verified with
   `tar tzf`, encrypted to a temporary name and renamed only after `age`
   succeeds; checksums are relative. Fault-inject a failing stage and confirm no
   success metric is written.
2. TD-17 is fixed (relative checksums). Complete RV-02's host tests: atomic
   textfile publication and missing-metric alert coverage before the first
   backup and after an injected failure.
3. Blanket volume pruning is removed (DR-09); monitoring volumes are never
   pruned. DR-17 is applied without duplicating timer ownership in G0-B.
4. TD-16 is accepted: Caddy's ACME state is deliberately excluded and re-issued
   through DNS-01 with the vault token and ACME email. Verify re-issuance and the
   certificate-expiry alert in the restore drill; do not add the state to the
   archive.
5. The restore runbook handles existing roles/globals, credential
   reconciliation, database creation, media ownership and a stopped write path;
   it is still manual (no restore playbook exists). Document PostgreSQL major
   upgrades (TD-04) from the same tested dump/restore primitives.
6. After a meaningful G0-E rehearsal import, use the **not-yet-live replacement
   host** as the disposable restore target: backup, rebuild from zero, restore,
   and verify row counts, roles, media hashes, Studio and every site. Legacy is
   still live, so no third production host is required. Record any deviation
   from D14 explicitly rather than claiming a drill that did not happen.

**Exit:** fault-injected backup stages fail visibly; checksums verify on another
machine; housekeeping preserves named state; a pulled archive restores onto a
from-zero host with working credentials, database, media and re-issued Caddy
certificates; the workstation pull and a fresh post-restore backup pass.

### G0-D — Close application/data defects before freezing the schema

1. **P1 first:** TD-06 gets a profile operation that changes only name/email,
   plus a concurrency regression test proving a profile save cannot re-enable an
   account. TD-14 is executed by G0-E; TD-01 belongs to G0-B.
2. **Editor correctness:** TD-07 propagates upload readiness and blocks saving an
   incomplete selection. TD-09 propagates dirty state to in-app and browser
   navigation, including cancel/close and successful-save reset behavior.
3. **Business lifecycle:** implement TD-08 as explicit transitions with stock
   restoration and audit behavior. Until decided and tested, remove unsafe
   reservation deletion/cancellation and non-draft campaign deletion rather than
   showing a misleading successful operation. Queued campaign cancellation must
   not silently leave mail sending.
4. **Data/security contracts:** narrow producer grants (TD-11) and test each real
   producer role, including queue replay and cross-schema denial. Resolve TD-15
   across subscriber storage, campaign generation, queued message bodies,
   existing links and retention; hashing one column alone is not a complete fix.
   Decide whether to harden or explicitly accept the Windows-only TD-05 risk.
5. **Regression strength:** TD-13's Checkstyle gate runs in `mvn test`; the
   real-PostgreSQL Java integration suite is accepted post-launch debt with the
   reason recorded in [tech-debt](tech-debt.md#td-13). Keep PostgreSQL-gated web
   tests non-skipping in CI. TD-10's typed authorization guard is an accepted
   deviation (middleware is mandatory by convention and the residual risk is
   recorded); TD-12's campaign bound is implemented at 500 active recipients
   with the typed `too-large` outcome.

**Exit:** every P1 application item is closed; no exposed Studio action can lose
an upload/edit or silently corrupt stock/campaign state; privilege tests run as
the actual roles; the full web and Java gates pass without relevant skips; the
migration baseline is ready to freeze.

### G0-E — Reconcile the owner-led manual migration

1. Inventory every legacy route, table, account, file, form and integration;
   mark migrate/replace/archive/drop. Capture a checksummed, sanitized extract
   and media manifest. Do not put production personal data in ordinary dev or in
   the checklist.
2. Maintain a short manual checklist, not an importer. Record every source-ID
   mapping, map every status/subject, map uncategorized contacts to `other`, and
   quarantine zero/invalid quantities instead of dropping them. Use Studio for
   ordinary records where practical and reviewed SQL only where it saves real
   effort; do not build a generic migration framework.
3. Disable all real email during rehearsal. Historical rows must not enqueue
   notifications. Copy media deliberately and reconcile file counts, samples and
   hashes appropriate to the small data set.
4. Record per-table source/migrated/skipped/failed counts and a media
   reconciliation report. Require `source = migrated + skipped + failed`, zero
   unexplained statuses, zero silent constraint failures and owner-approved
   skips.
5. Rehearse Uncle-T first (O-002), then apply the same checklist to Jublawoma and
   Zelglihof. Run the G0-C restore drill against the meaningful rehearsal data
   before the final freeze.

**Exit:** one clean manual rehearsal and the final run follow the same reviewed
checklist; counts, IDs, content samples, Unicode, drafts, dates, deleted states
and media reconciliation are accepted. No importer is built or maintained.

### G0-F — Accept the sites and execute the gate

1. Finish owner content/legal/wording/mailbox decisions, real photos, final
   illustrations, display prices, reservation/donation rules and retention.
   Legal, wording and mailbox defaults are resolved; real photos and final
   content assets remain owner-executed. Oliumbi is a static placeholder on
   `:8004`; the apex route exists and is not an accidental redirect.
2. Verify real role permissions, unpublished content, shared media and queues.
   Complete keyboard/focus/contrast/mobile checks and the German content pass.
3. Add one-hop legacy redirects, canonical hosts, metadata, social previews,
   content sitemaps, robots and real 404/410 behavior. Crawl migrated routes.
4. Run the environment integration pass: publishing, every form, reservations,
   login/logout/disable, email delivery and one service outage. Replay a public
   submission and prove the original outcome with no duplicate row, stock
   movement or email. Test uncertain SMTP outcomes conservatively.
5. Confirm secure cookies, sender DNS/SMTP identities, public URLs, health,
   external alerts, workstation backup pull, restore report and rollback target.
   Record the release and verification evidence.

**Exit:** the union of the launch gate, DR-04–DR-07, RV-01–RV-04 and every P1 TD
is closed or explicitly accepted by the owner; no unfinished feature is exposed;
the per-site launch checklists are signed.

### Cutover and legacy retirement

1. Confirm the legacy backup is restore-readable and the new rehearsal/restore
   evidence is current. Lower TTL if needed and record old/new artifact IDs.
2. Freeze legacy writes; take the final PostgreSQL 17 export and media manifest;
   repeat the rehearsed manual migration checklist and reconciliation into
   PostgreSQL 18.
3. Deploy the accepted pinned tag, run internal smoke tests, then switch router
   forwarding/DNS and explicitly enable live dyndns (RV-03).
4. Verify TLS, redirects, forms, Studio permissions, media, logs, health and mail.
   Take a fresh new-system backup and pull it before opening the observation
   window. Apply RV-04 before any rollback that could strand new writes.
5. Keep legacy protected until acceptance. Retire credentials, `api.*` records,
   containers and volumes only after final archives restore and the observation
   window closes. Remove `legacy/` only after its needed knowledge is maintained
   elsewhere.

## Execution log

| ID | Status | Notes |
| --- | --- | --- |
| G0-A | code complete; evidence outstanding | O-006/O-010 are ratified, RV-03 defaults dyndns off and RV-04 is in the migration/runbook text. Owner must still verify legacy exposure and that a parallel host cannot change live DNS. |
| G0-B | code complete; real-host verify | DR-04–DR-07, DR-10–DR-16, DR-18–DR-20, RV-01/02 and TD-01/02/03 are implemented. Outstanding: role provisioning/config readability, DNS records, TLS probe series, monitoring restarts, the first CI image run and the SSH toggle on the host. |
| G0-C | code complete; drill outstanding | Fail-closed outer archive, relative checksums, atomic textfile, no volume prune and templated timers are in place. The data-bearing restore drill and ACME re-issuance verification are still outstanding; restore remains a manual runbook, not a playbook. |
| G0-D | code complete; TD-14 execution remains | TD-05/06/07/08/09/11/12/17 are fixed. TD-13's Checkstyle gate is closed and the real-PG suite is accepted post-launch; TD-14 execution belongs to G0-E. |
| G0-E | owner-led, not executed | Manual migration (D16); no importer will be built. Needs a sanitized rehearsal, mappings and reconciliation evidence. |
| G0-F | owner acceptance | Owner content/legal decisions are resolved; real photos, redirects, sitemaps and the environment integration pass remain. |
| Cutover | blocked | Requires real-host, DNS/SMTP, backup/restore and G0-E evidence. The Oliumbi placeholder is present; the first durable public write is the point of no return. |

## After launch

Only after the launch gate: notification routing, per-recipient campaign results,
allowed senders/List-Unsubscribe, image publication retention, the remaining
translations/URL decisions, real Oliumbi content, and the explicitly deferred
public-account features. Revisit accepted limitations only when their stated
conditions change; do not turn them into launch blockers.
