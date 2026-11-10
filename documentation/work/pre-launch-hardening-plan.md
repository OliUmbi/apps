# Pre-launch hardening plan

**Status:** IN PROGRESS, 2026-11. Packages PH-1 to PH-6 are code complete and
committed. The registers remain the issue checklist; this file owns sequencing,
file ownership and acceptance evidence.

**Context:** the go-live remediation plan closed the review findings. This plan
lands the decisions taken in the pre-launch review: the small correctness and
security fixes first, then the observability, analytics and content work.

## Packages and exclusive file ownership

A package may write only its listed paths. A package is done when its acceptance
evidence exists and the registers are updated.

| ID | Scope and owned paths | Depends on |
| --- | --- | --- |
| PH-1 | Service image builds and CI pins. `services/*/Dockerfile`, `.github/workflows/ci.yml`. | - |
| PH-2 | Session boundary tests. `web/sites/studio/src/server/{session,auth.server}.ts`, `web/tests/studio-session.test.ts`. | - |
| PH-3 | Subscriber correction rules. `web/packages/zelglihof-data/src/subscriber.service.ts`, `web/sites/studio/src/components/newsletter/subscriber-email-form.tsx`, `web/tests/subscriber-service.test.ts`, catalog. | PH-4 for the audit call |
| PH-4 | Audit trail. `database/migrations/V006__studio.sql` (audit table), `web/sites/studio/src/server/audit*`, the wired handlers, the Studio view, catalog. | - |
| PH-5 | Operational retention. `ansible/files/housekeep.sh`, `ansible/roles/housekeep/**`, `ansible/group_vars/all.yml`, `infrastructure/monitoring/alerts.yml`, `documentation/operations/housekeeping.md`. | PH-4 |
| PH-6 | Anonymous analytics. `database/migrations/V011__analytics.sql`, `web/packages/analytics/**`, the two site endpoints and root hooks, `web/sites/studio/src/server/traffic.functions.ts`, `web/sites/studio/src/components/traffic-view.tsx`, catalog. | - |
| PH-7 | Observability. `services/*/pom.xml` + `application.yaml`, messaging metrics, `infrastructure/units/**`, `infrastructure/monitoring/**`, `infrastructure/caddy/{Caddyfile,Dockerfile}`, `ansible/roles/app/**`, `documentation/operations/monitoring.md`. | - |
| PH-8 | Backup key recovery. `documentation/operations/backup-restore.md`, `ansible/group_vars/vault.yml.example`, `ansible/README.md`. Owner prints the recovery sheet. | Owner |
| PH-9 | German URLs and catalog literals. `web/packages/i18n/**`, site route metadata and links, catalog. | Owner route map (approved) |
| PH-10 | SEO. `web/packages/seo/**`, sitemap/robots routes, canonical and JSON-LD, redirect map. | PH-9, legacy URL inventory |
| PH-11 | Oliumbi edges and the accessibility shortlist. `web/sites/oliumbi/**`, site shells and styles. | - |
| PH-12 | Supply chain and the manual version procedure. `.github/workflows/**`, `documentation/reference/versions.md`. | - |
| PH-13 | Documentation closure. `documentation/reference/decisions.md`, both registers, component READMEs trimmed to structure. | All |

## Execution log

| ID | Status | Notes |
| --- | --- | --- |
| PH-1 | done | Checkstyle config copied into all three service builds; CI and the migrator share Flyway 13.12.1. `docker build` of the assets image verified locally. |
| PH-2 | done | `session.ts` extracted; 7 tests pin the `__Host-` prefix, flags, encoding, downgrade rejection and 401/404-only invalidation. |
| PH-3 | done | Same-address correction is a no-op; Studio distinguishes unchanged, confirmation-sent, unsubscribed and conflict. Test added. |
| PH-4 | done | `studio.audit_event` (append-only), admin-only view, 17 wired actions, no before/after. Decision D26. |
| PH-5 | done | 12-month delivery history, 30-day inbox rows, 18-month audit, 25-month analytics; flock, success metric and `HousekeepStale`. Decision D27, debt TD-22. |
| PH-6 | done | `analytics.view_daily`, route-id beacon on Unclet and Zelglihof, per-site Studio panel, no cookies/identifiers/referrer; privacy text updated. Decision D25. |
| PH-7 | in progress | Micrometer on the three services, queue gauges (counts + oldest age), Caddy edge metrics, postgres_exporter with the `monitoring` role, coverage rules for service/pool/queue/connections/probe absence/TLS, `Permissions-Policy`, a 5xx body, and the messaging batch/lease/shutdown fix. Prometheus config and 18 rules validate with `promtool`; Caddy validate runs in the image build. |
| PH-8 | done (owner prints the sheet) | Passphrase-wrapped age identity, printed recovery sheet, and the restore commands updated to the wrapped identity. The drill itself remains owner-executed. |
| PH-9 | partial | German public paths shipped (D32) with a test and updated sitemaps. The remaining hard-coded TSX labels are still open. |
| PH-10 | partial | Canonical links, LocalBusiness/Organization JSON-LD and dynamic `/sitemap.xml` routes (static pages + articles/products/showcases/stories) ship. The legacy redirect map needs the migration URL inventory. |
| PH-11 | partial | Oliumbi has robots, sitemap, branded 404/error and a check test; the three German sites have skip links and a `main` target. Focus after submit, `aria-describedby` and reduced motion remain. |
| PH-12 | done (first remote run pending) | `gitleaks` + report-only Trivy in CI, blocking weekly `security.yml` (Trivy, gitleaks, `pnpm audit --prod`), a dev-placeholder allowlist, and the 10-step monthly refresh checklist. |
| PH-13 | in progress | Decisions D25-D32, both registers, the plan and the V012 head are updated. Trimming the component READMEs to structure only remains. |

## Acceptance evidence

- PH-1: the CI images job is green on a real remote run.
- PH-2 to PH-4: `pnpm test` green, including the PostgreSQL-gated suites.
- PH-5: `apps-housekeep.service` runs once on the host, the metric appears and
  an injected failure leaves `HousekeepStale` firing.
- PH-6: a navigation on Unclet and Zelglihof increments `analytics.view_daily`;
  the Studio panel shows the day and the route; no cookie is set.
- PH-7: Prometheus scrapes the three services and Caddy, the new rules fire
  when tested, and the probe-silence rule catches a stopped blackbox.
- PH-8: a restore from a pulled archive using the printed identity and its
  passphrase, recorded in the restore drill.
