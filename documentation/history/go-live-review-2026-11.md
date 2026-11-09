# First go-live review - 2026-11

**Status:** review complete at commit `2fc721d`. RV-01 through RV-04 are open;
RV-05 was corrected during the review. This is frozen evidence. Live tasks are
in [open work](../work/open-work.md); sequencing is in the
[go-live remediation plan](../work/go-live-remediation-plan.md).

*Owner clarification (2026-11): the small legacy data set will be migrated by
hand (D16), so no importer is required. The committed legacy credential values
were placeholders and are already handled. These clarifications supersede the
initial importer/rotation planning assumptions without changing the review
evidence below.*

## Context and scope

`legacy/` is the currently deployed and authoritative system. The replacement
will be built from the ground up on a clean host for its first go-live. The
review therefore prioritized clean bootstrap, failure recovery, migration and
cutover over hypothetical scale.

Reviewed maintained documentation, current web/identity/data paths tied to the
known debt, deployment inputs, monitoring, backup/housekeeping and migration
tooling. Frozen history was used only as evidence. This was a targeted static
review, not an exhaustive security audit or a deployed-system test.

## Verification

| Check | Result |
| --- | --- |
| `pnpm check` | pass |
| `pnpm typecheck` | pass |
| `pnpm test` | pass; `STUDIO_TEST_ADMIN_URL` was unset, so the two PostgreSQL-gated suites did not run locally |
| `pnpm build` | pass, all four sites |
| `pnpm --filter studio build` | pass |
| `services\mvnw.cmd -f services/pom.xml test` | reactor `BUILD SUCCESS`; one assets symlink test skipped on Windows |
| `docker compose -f infrastructure/compose.dev.yaml --env-file infrastructure/.env.dev config` | pass |
| Maintained relative Markdown links | 265 targets in 39 documents existed at the initial review |
| Remote CI, real host, DNS, SMTP, backup pull and restore | not exercised |

The worktree was clean before the review. The local green gates agree with the
existing deployment review, but they do not cover a clean production bootstrap.

## RV-01 - Systemd alerts have no configured metric source

**Evidence:** `infrastructure/monitoring/alerts.yml` defines `UnitFailing` and
`UnitRestartLoop` from `node_systemd_unit_state` and
`node_systemd_unit_start_time_seconds`. `infrastructure/units/apps-node-exporter.container`
sets rootfs/textfile options but does not enable `--collector.systemd` or wire
access to host systemd. Node-exporter v1.12.1 documents the systemd collector as
disabled by default.

**Impact:** the two unit-failure alerts can silently have no series. A green or
quiet monitoring display would not prove that failed/restarting units are
covered.

**Required fix:** enable and wire host systemd collection (adding only the flag
is not enough if the container cannot reach host systemd), verify both metric
series on the real host, then fire both alerts and confirm recovery reaches the
phone.

*Disposition (2026-11): open (G0-B) - tracked as RV-01 in open work.*

## RV-02 - Backup alerting misses a never-created metric

**Evidence:** `BackupStale` in `infrastructure/monitoring/alerts.yml` evaluates
only `time() - apps_backup_last_success_timestamp_seconds > 36 * 3600`; it has no
`absent()` branch. `ansible/files/backup.sh` writes
`apps_backup.prom` directly instead of writing a temporary file and renaming it.

**Impact:** a fresh host or a backup that never reaches its first success has no
stale-backup series to alert on. A scrape during the direct write can also read
a partial metric file.

**Required fix:** alert on absent and stale success metrics, publish the
textfile atomically, and test before the first backup and after an injected
failure.

*Disposition (2026-11): open (G0-B/G0-C) - tracked as RV-02 in open work.*

## RV-03 - Clean-host setup can change live DNS before cutover

**Evidence:** `ansible/playbooks/site.yml` applies the `dyndns` role;
`ansible/roles/dyndns/tasks/main.yml` enables and starts its timer; the timer
runs two minutes after boot and every 15 minutes. `ansible/group_vars/all.yml`
lists the live apex/www names. The operations guide says legacy stays untouched
until cutover, but the role has no pre-cutover disable/gate.

**Impact:** a parallel replacement host can update production A records before
the final import and smoke tests, causing an unintended cutover or outage.

**Required fix:** make pre-cutover the safe default and prevent live updates
until an explicit cutover action. Keep router forwarding and live DNS on legacy
through rehearsals.

*Disposition (2026-11): open (G0-A) - tracked as RV-03 in open work; the access
guide now carries an explicit warning.*

## RV-04 - DNS rollback can strand post-cutover writes

**Evidence:** `documentation/work/migration.md` defines rollback in terms of
application/routing compatibility and prohibits down-migrations as the default,
but its cutover sequence did not define how new durable writes return to legacy.
The new system has no reverse synchronization path to legacy.

**Impact:** after visitors submit forms or make reservations on the replacement,
switching DNS/routing back can make those accepted writes invisible. Rolling
back the application version does not reconcile the two authoritative data sets.

**Required fix:** define the point of no return and an export/replay or
roll-forward procedure for post-cutover writes before enabling public forms.
Keep legacy protected until acceptance and final restore-tested archives exist.

*Disposition (2026-11): open (G0-A) - tracked as RV-04 in open work; the
migration guide now states the data-safety gap.*

## RV-05 - Maintained documentation disagreed with implementation

Three concrete mismatches were confirmed:

1. `database/README.md` and the data subsystem page described production role
   provisioning as current behavior although no Ansible equivalent exists
   (DR-04). They now say it is required and not implemented.
2. The native-development commands in `documentation/development/local-setup.md`
   and `web/README.md` omitted the one-shot `roles` service, leaving fresh
   application roles `NOLOGIN`. Both commands now include `roles`.
3. The assets subsystem said public image reads use the internal token. The
   public proxy and controller intentionally use the visible-asset endpoint
   without management credentials; the flow now says so.

The compose comment about production provisioning and the restore-drill
hardware wording were also synchronized with the clean-host plan.

*Disposition (2026-11): fixed - the maintained pages were corrected and their
relative links/anchors rechecked. No open work item remains for RV-05.*

## Existing findings reconfirmed

- DR-04 is a hard clean-bootstrap blocker: application roles are `NOLOGIN`, and
  no production task provisions them after migration.
- TD-06 remains real: Studio reads `enabled` and sends it through the general
  administrative account update.
- TD-07/TD-09 remain real: upload pending state and editor dirty state do not
  reach save/navigation controls.
- TD-08 needs safe containment until policy lands: reservation deletion/status
  changes do not restore stock, and campaign delete is not restricted to draft.
- TD-14 is larger than a validation pass: no maintained importer or
  reconciliation tooling exists under `database/` or elsewhere in the
  replacement.
- DR-08's original media-tar example is partly stale: media is already written
  to a file. The outer `tar ... | age ...` pipeline can still mask tar failure.
- DR-15 through DR-20 were absent from both live registers. They are now listed
  in `open-work.md` and included in the remediation packages.

## What is healthy

- The documentation has clear ownership, reading paths, live-vs-history rules,
  decision records and explicit quality priorities.
- The architecture is appropriately small for one maintainer: independent sites,
  one host, one PostgreSQL server and clear capability ownership.
- Local web/Java/build checks pass, and CI has PostgreSQL-gated web coverage and
  deployment-input syntax/generation checks.
- Identity uses BCrypt password hashes, random session tokens stored as hashes,
  account row locks and session revocation. Studio handlers consistently use
  server-side actor checks in the reviewed inventory.
- Public writes are designed around durable rows, transactionally queued mail,
  idempotency keys and explicit outcomes.

## Recommended execution

Use the [first go-live remediation plan](../work/go-live-remediation-plan.md).
In particular, complete RV-03 before running `site.yml` on a parallel host, and
use the not-yet-live replacement host as the disposable restore target after a
meaningful import rehearsal while legacy remains live.
