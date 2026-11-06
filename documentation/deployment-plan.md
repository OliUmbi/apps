# Deployment plan

Execution plan for the 2026-11 deployment migration: the server stops running
Docker Engine + Compose and instead runs every workload as a **systemd unit
managed by podman (Quadlet)**. The server is not yet rebuilt in the new
approach, so this lands before the legacy cutover and costs nothing in
production migration.

This is an execution document like [refactoring-plan.md](refactoring-plan.md):
numbered work packages with exclusive file ownership, findings to close,
acceptance criteria, and an execution log. When it disagrees with an older
document, this document wins for sequencing; `decisions.md` stays authoritative
for direction.

## 0. Scope and priorities

Ordered by `principles.md`: data integrity and security first, then
recoverability, then maintainability.

In scope: `infrastructure/units/**` (new), `services/assets/Dockerfile`,
`ansible/**`, `infrastructure/compose.{prod,monitoring,restore}.yaml`
(removed), `documentation/**`, `AGENTS.md`, root `README.md`.

Out of scope: `web/**`, `services/**` (except the one Dockerfile),
`database/**`, `.github/**` (images on ghcr are unchanged; CI keeps validating
`compose.dev.yaml`), `legacy/**`. Local development keeps Docker Desktop and
`compose.dev.yaml` untouched.

## 1. Decisions adopted for this pass

Recorded here and in `decisions.md` (D11–D15) at the end of the pass.

| # | Decision |
| --- | --- |
| D11 | **Podman + Quadlet replaces Docker Compose on the server.** Every workload is a systemd unit (`apps-*.service` generated from `*.container` files in `infrastructure/units/`), installed by Ansible like the existing timer units. No container daemon, no compose on the server; service discovery keeps container names so the Caddyfile and monitoring configs are unchanged. Secrets move to per-service `EnvironmentFile=/etc/default/apps-<service>` (0600 root), mirroring the timer convention. |
| D12 | **State the backup covers lives in plain host directories under `/var/lib/apps/`.** `postgres`, `media`, `caddy` state become bind mounts instead of named volumes; backup/restore is `pg_dump` + `tar` on the host. Monitoring state (prometheus/grafana) stays on named podman volumes — it is not backed up today and stays that way. |
| D13 | **Deploy stays manual and pinned by image tag.** Ansible templates the units with `{{ image_tag }}`, pulls, then restarts the stack in dependency order (postgres → migrate → apps → caddy). Rollback is deploying the previous tag (`P-009`). The ordered restart replaces `compose up -d`'s change-detection: acceptable at this scale, and predictable. |
| D14 | **The restore drill is deferred to a dedicated machine.** The workstation drill (`compose.restore.yaml`) is removed with the compose files; the future drill rebuilds a machine from zero and restores a backup into it. Blocked on hardware; tracked in `open-work.md`. |
| D15 | **cAdvisor is dropped.** It is the only docker-coupled monitoring piece (`/var/lib/docker` mount). node-exporter, blackbox and the alerting rules cover the low-traffic single-host case; `podman stats` remains available on demand. |

## 2. Baseline and verification

Verification for infra work (from the repository root):

```powershell
docker compose -f infrastructure/compose.dev.yaml config   # after compose/container changes
ansible-playbook --syntax-check ansible/playbooks/site.yml # after ansible changes (each playbook)
```

Unit files (`*.container`) cannot be validated on the workstation; they are
verified on the rebuilt server (per-package acceptance). PowerShell caveat as
in [refactoring-plan.md](refactoring-plan.md) §2: judge success by output, not
by piped exit codes.

## 3. Work packages

Ownership rule: a package may only write its listed paths. Sequencing is
strict (S2 depends on S1's file names, S5 removes what S1–S4 replace).

| ID | Package | Findings | Owns | Acceptance |
| --- | --- | --- | --- | --- |
| S0 | **Plan committed** | — | `documentation/deployment-plan.md` | This document. |
| S1 | **Quadlet units for the whole stack** | DP-01, DP-02, DP-03, DP-05, DP-06 (D11, D12, D15) | `infrastructure/units/**` (new), `infrastructure/monitoring/{prometheus.yml,alerts.yml}`, `services/assets/Dockerfile` | One `.container` per workload + `apps.network` + `monitoring.network`; every image pinned (no `:latest`); health checks use busybox `wget` (`/actuator/health` for services, `/` for sites) — no `bash`; container names match the current service names; secrets only via `EnvironmentFile=`, never inline; `Type=oneshot` migrate with `After=`/`Requires=` ordering. |
| S2 | **Server role: podman instead of docker** | DP-07 (D11) | `ansible/roles/server/**` | No docker apt repo, packages, `daemon.json` or `docker` group left; podman installed from Debian's own repo; journald logging/caps documented; role is idempotent. |
| S3 | **App role, deploy, status, logs on systemd** | DP-08 (D11, D13) | `ansible/roles/app/**`, `ansible/playbooks/{deploy,status,logs}.yml` | Units and per-service env files rendered and started; deploy with `-e image_tag=` pulls and restarts in dependency order; `status.yml` shows units/timers/disk; `logs.yml` reads `journalctl -u apps-<service>`. |
| S4 | **Backup and housekeeping scripts** | DP-04 (D12) | `ansible/files/{backup.sh,housekeep.sh}`, `ansible/roles/{backup,housekeep}/**` | `backup.sh` dumps postgres via `podman exec` and tars `/var/lib/apps/media` directly (no volume-name literal, no helper container); `housekeep.sh` prunes podman images/containers; both still systemd-timer driven. |
| S5 | **Remove compose files, sync documentation** | DP-09 (D11–D15) | `infrastructure/compose.{prod,monitoring,restore}.yaml` (deleted), `infrastructure/README.md`, `ansible/README.md`, `documentation/{operations,architecture,decisions,open-work}.md`, `AGENTS.md`, root `README.md` | No reference to a server-side compose stack remains; decisions C-005 and the operations block are amended (D11–D15 recorded); open-work carries the deferred restore drill and the pre-cutover rebuild checklist. |

### Unit inventory (S1)

| Unit | Image | Notes |
| --- | --- | --- |
| `apps-postgres.container` | `postgres:18-alpine` (digest-pinned) | `/var/lib/apps/postgres:/var/lib/postgresql` (entrypoint chowns; uid 70:70 verified), `HealthCmd=pg_isready` |
| `apps-migrate.container` | `ghcr.io/oliumbi/apps-migrate:{{ image_tag }}` | `Type=oneshot`; flyway args via `$VAR` from `/etc/default/apps-migrate` (`-connectRetries=60` replaces the compose health-gating) |
| `apps-identity/-messaging/-assets.container` | `ghcr.io/oliumbi/apps-*:{{ image_tag }}` | `HealthCmd=wget … /actuator/health`, `After=`/`Requires=apps-migrate.service`; assets mounts `/var/lib/apps/media:/media` |
| `apps-jublawoma/-unclet/-zelglihof/-studio.container` | `ghcr.io/oliumbi/apps-*:{{ image_tag }}` | `HealthCmd=wget … :800x/`; `ContainerName=` keeps the bare service names for the Caddyfile |
| `apps-caddy.container` | `ghcr.io/oliumbi/apps-caddy:{{ image_tag }}` | publishes 80/443 tcp + 443 udp; `/var/lib/apps/caddy-{data,config}` |
| `apps-prometheus/-alertmanager/-node-exporter/-blackbox/-grafana.container` | upstream images, pinned tags | bind-mounted config from `/apps/monitoring`, ports on `{{ monitoring_bind }}`, prometheus/blackbox on both networks; state on named volumes |

### Environment files (S3)

`env.j2` becomes per-service templates rendered to `/etc/default/apps-<service>`
(0600 root) — same pattern as the timer units:

- `apps-postgres`, `apps-migrate` (db name, migrator credentials)
- `apps-identity`, `apps-messaging`, `apps-assets` (db + internal tokens)
- `apps-jublawoma`, `apps-unclet`, `apps-zelglihof`, `apps-studio`
  (composed `DATABASE_URL`, service URLs, request emails)
- `apps-caddy` (ACME email, Infomaniak token), `apps-grafana` (admin password)

## 4. Findings

Review findings of the current deployment surface, closed by this pass:

- **DP-01** — Java health checks run `bash -c 'exec 3<>/dev/tcp/…'` against
  `eclipse-temurin:25-jre-alpine`, which has no `bash` (verified; busybox
  `wget` exists). The three services are permanently "unhealthy" in
  `docker compose ps`. *Disposition (2026-11): fixed (S1) — health checks use
  `wget` against `/actuator/health`.*
- **DP-02** — cAdvisor mounts `/var/lib/docker/` and is docker-coupled.
  *Disposition (2026-11): fixed (S1, D15) — dropped.*
- **DP-03** — monitoring images run `:latest` ("TODO pin on first deploy").
  *Disposition (2026-11): fixed (S1) — pinned tags.*
- **DP-04** — `backup.sh` hard-codes the compose volume name
  `oliumbi-apps_assets-data` and reads it through a helper container.
  *Disposition (2026-11): fixed (S4, D12) — media is a plain directory.*
- **DP-05** — `compose.monitoring.yaml` couples to compose naming
  (`oliumbi-apps_apps` external network). *Disposition (2026-11): fixed (S1) —
  quadlet networks.*
- **DP-06** — container uid/gid are implicit (`adduser -S` picks 100:101);
  bind mounts make them load-bearing. *Disposition (2026-11): fixed (S1) —
  assets image pins 100:100, postgres 70:70 documented.*
- **DP-07** — log rotation lives in `/etc/docker/daemon.json` with a
  restart-docker handler and `docker` group membership for `deploy`.
  *Disposition (2026-11): fixed (S2) — journald is the log store; the group is
  gone (sudo remains).*
- **DP-08** — Ansible shells out to `docker compose` for pull/up/ps/logs.
  *Disposition (2026-11): fixed (S3) — systemd + journalctl + podman pull.*
- **DP-09** — the production topology is defined twice after this pass
  (quadlet units for the server, `compose.dev.yaml` for the workstation).
  *Disposition (2026-11): accepted (S5) — dev compose builds from source and
  is a development rig, not a mirror; the READMEs state the rule.*

## 5. Owner-gated / deferred

- **Restore drill on a dedicated machine** (D14): rebuild from zero, restore a
  backup, walk every site. Blocked on spare hardware; procedure to be written
  when the machine exists. Until then the backup *pull* keeps proving that
  archives leave the server intact.
- **Production role passwords** (D9, existing open-work item) remain outside
  this pass and are re-verified on the rebuilt server.

## 6. Execution log

| ID | Status | Notes |
| --- | --- | --- |
| S0 | done | Plan committed. |
| S1 | done | Units + network/volume files + assets uid pin; monitoring images pinned; cAdvisor dropped. |
| S2 | pending | |
| S3 | pending | |
| S4 | pending | |
| S5 | pending | |
