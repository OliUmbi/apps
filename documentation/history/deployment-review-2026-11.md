# Build and deployment review - 2026-11

Review of the path from source to a running host: build configs, Dockerfiles,
GitHub Actions, Ansible, systemd/Quadlet units, Caddy, monitoring and the
operations scripts.

**Status:** review complete. DR-01, DR-02 and DR-03 were fixed during the
review and verified. All other findings are open. This is evidence; actionable
items are linked from [work](../work/README.md).

## Scope and method

Reviewed:

- `.github/workflows/ci.yml`, `.github/workflows/publish.yml`
- all `Dockerfile`s, `web/package.json`, `web/pnpm-workspace.yaml`,
  `services/pom.xml`, the Maven wrapper
- `infrastructure/units/**`, `infrastructure/caddy/**`,
  `infrastructure/monitoring/**`, `infrastructure/compose.dev.yaml`
- `ansible/playbooks/**`, `ansible/roles/**`, `ansible/group_vars/**`,
  `ansible/files/**`
- `.dockerignore`, the build-time environment templates

Commands run locally on 2026-11-06:

| Check | Result |
| --- | --- |
| `pnpm check` | pass (534 files) |
| `pnpm typecheck` | pass |
| `pnpm test` | pass; 129 pass, 2 PostgreSQL-gated skips locally |
| `pnpm build` | pass, all four sites |
| `services\mvnw.cmd -f services/pom.xml test` | pass, reactor `BUILD SUCCESS` |
| `docker compose -f infrastructure/compose.dev.yaml --env-file infrastructure/.env.dev config` | pass |
| Ansible `--syntax-check` for every playbook | pass (exit 0) |
| Quadlet generation of `infrastructure/units` | **19 services for 20 input files** (fixed: DR-02) |
| `docker build -f services/assets/Dockerfile .` | **fails** (fixed: DR-03) |
| `docker build -f web/sites/studio/Dockerfile .` | pass |
| `docker build -f services/identity/Dockerfile .` | pass |
| `docker build -f database/Dockerfile .` | pass |
| `docker build -f infrastructure/caddy/Dockerfile .` | pass |

The code-level gates are healthy. The deployment path is not yet executable.

## P1 - blockers

### DR-01 - CI cannot execute the Maven wrapper

**Evidence:** `services/mvnw` is tracked with mode `100644`
(`git ls-files -s services/mvnw`), but `.github/workflows/ci.yml` runs it
directly: `services/mvnw -B -ntp -f services/pom.xml test`.

**Impact:** the `java` job fails with permission denied on Linux before any
test runs. Because `publish.yml` calls `ci.yml` as a gate, every release is
blocked.

**Fix:** either commit the executable bit (`git update-index --chmod=+x
services/mvnw`) or invoke it as `sh services/mvnw ...` in CI. Do both as
defence: the file should be executable for local Linux use.

*Disposition (2026-11): fixed - `services/mvnw` is now tracked as `100755`; the
CI command is unchanged and can execute it.*

### DR-02 - The CI deployment job always fails on the units count

**Evidence:** `.github/workflows/ci.yml` counts every file in
`infrastructure/units`:

```sh
expected=$(ls /tmp/units | wc -l)
generated=$(ls /out | grep -c "\.service$")
test "$generated" -eq "$expected"
```

The directory contains `README.md`. The local replication printed
`generated 19 of 20`; the 19 generated services are the actual `.container`,
`.network` and `.volume` units.

**Impact:** the `deployment` job fails on every run, which also blocks
`publish.yml` through the `verify` job.

**Fix:** count only unit sources, for example
`find /tmp/units -maxdepth 1 -type f \( -name '*.container' -o -name '*.network' -o -name '*.volume' \) | wc -l`,
or move the README outside the mounted directory.

*Disposition (2026-11): fixed - the CI count now filters to unit files; the
local replication prints `generated 19 of 19` and exits 0.*

### DR-03 - The assets image cannot build

**Evidence:** `services/assets/Dockerfile` runs:

```dockerfile
RUN addgroup -S -g 100 app && adduser -S -u 100 -G app app
```

The base `eclipse-temurin:25-jre-alpine` already uses GID 100 for `users`.
The local build failed with `addgroup: gid '100' in use`.

**Impact:** `apps-assets` cannot be published. `publish.yml` builds the whole
matrix with `fail-fast: false`, so the release still fails overall and the
assets image stays stale or missing.

**Fix:** reuse the existing group:

```dockerfile
RUN adduser -S -u 100 -G users app
RUN mkdir -p /media && chown app:users /media
```

Alternatively choose a new UID/GID and update the Ansible media ownership and
the unit docs together. Reusing `users` keeps `/var/lib/apps/media` at
`100:100`, which the units and backup script already assume.

*Disposition (2026-11): fixed - the image now creates UID 100 in the existing
`users` group and chowns `/media` to `app:users`; `docker build` succeeds.*

### DR-04 - Production database roles are never provisioned

**Evidence:** `database/migrations/V001__schemas.sql` creates every application
role `NOLOGIN` without a password. The development compose rig then runs an
`ALTER ROLE ... LOGIN PASSWORD ...` one-shot (`infrastructure/compose.dev.yaml`,
`roles`). The production Ansible roles contain no equivalent task: a search for
`ALTER ROLE`, `LOGIN` or `PASSWORD` in `ansible/**` finds nothing.

The production environment templates still set passwords
(`env-identity.j2`, `env-messaging.j2`, `env-assets.j2`, `env-studio.j2`, site
`env-*.j2`).

**Impact:** on a fresh host, migrate succeeds, then identity, messaging, assets,
Studio and every site fail to authenticate. The stack never becomes healthy.

**Fix:** add a post-migrate Ansible task (or a small `database` role) that runs
the same `ALTER ROLE ... LOGIN PASSWORD ...` statements as the dev `roles`
service, from the vault, before the application units start. Keep the migrator
role separate from the application roles. Add a smoke check that each role can
open a connection.

### DR-05 - Monitoring containers cannot read their configuration

**Evidence:** `ansible/roles/app/tasks/main.yml` creates `/apps` with mode
`0750` root:root and copies `infrastructure/monitoring/` with mode `0640`.
The containers receive no `User=` override. The image users are:

| Image | Runtime user |
| --- | --- |
| `prom/prometheus` | `nobody` (65534) |
| `prom/alertmanager` | `nobody` (65534) |
| `prom/node-exporter` | `nobody` (65534) |
| `grafana/grafana` | `grafana` (472), group root |
| `prom/blackbox-exporter` | root |

`/apps` with `0750` root:root is not traversable by `nobody`, and the config
files with `0640` root:root are not readable by it. Prometheus and Alertmanager
therefore fail to load their configuration. Grafana only works if the copied
directories retain execute permission; the current `copy` mode does not make
that guarantee.

**Impact:** monitoring and alerting do not start, so backup and availability
alerts are silent. This is especially dangerous because the host is the only
monitoring location.

**Fix:** make `/apps` traversable (`0755`), make non-secret configs readable by
the consuming users (`0644` or a shared group), and keep the Alertmanager
webhook URL on a narrower permission with the matching group. Verify with the
actual image users in the rebuilt host check.

### DR-06 - The deploy default is `latest`, not a pinned tag

**Evidence:** `ansible/group_vars/all.yml` sets `image_tag: "latest"`. Both
`site.yml` and `deploy.yml` accept that default. The units use
`{{ image_tag }}` and `deploy.yml` pulls the referenced image.

**Impact:** a first `site.yml` or a deploy without `-e image_tag=...` runs
mutable `latest` images, contrary to C-005/P-009 and the deployment docs. The
release log and rollback target become meaningless.

**Fix:** remove the default and fail when `image_tag` is unset, or default to a
known pinned release and reject `latest` explicitly in `deploy.yml`. Document
the required argument as part of the command.

### DR-07 - Studio has no managed DNS record

**Evidence:** the Caddyfile routes `studio.oliumbi.ch`
(`infrastructure/caddy/Caddyfile`), but `dyndns_records`
(`ansible/group_vars/all.yml`) lists only `oliumbi.ch`, `www.oliumbi.ch` and
`vpn.oliumbi.ch` for that domain. The customer domains likewise have no
`studio.*`/`admin.*` records, although the Caddyfile redirects those names.

**Impact:** unless a wildcard DNS record exists and is maintained outside this
list, `studio.oliumbi.ch` does not resolve. Studio is the primary administration
entry point, so this blocks launch. The legacy `studio.*`/`admin.*` redirects
also silently do nothing.

**Fix:** add `studio.oliumbi.ch` and the intended `studio.*`/`admin.*` names to
`dyndns_records` (and create them once in Infomaniak), or document an explicit
wildcard record and make it managed. Verify with `dig` after the first timer
run.

## P2 - fix before relying on the affected path

### DR-08 - The backup pipeline can hide a tar failure

**Evidence:** `ansible/files/backup.sh` uses `#!/bin/sh` and `set -eu`, then
`tar czf - -C "$MEDIA_DIR" . | age ...`. Without `pipefail`, the pipeline's
status is `age`'s status; a failed `tar` can still leave an age-encrypted
archive that looks successful. The same script writes `SHA256SUMS` with
absolute temporary paths (`sha256sum "$WORK"/*`), already tracked as
[TD-17](../work/tech-debt.md#td-17).

**Impact:** a corrupt or incomplete media backup can pass the timer and write a
freshness metric. The checksum file is also not directly verifiable after
extraction on another machine.

**Fix:** write the tar to a file first, or use `set -o pipefail` (the Debian
dash supports it) and write relative checksums from the work directory. Verify
the archive before encryption and test the procedure in the restore drill.

### DR-09 - Housekeeping can delete named monitoring volumes

**Evidence:** `ansible/files/housekeep.sh` runs `podman container prune -f`
before `podman volume prune -f`. Monitoring uses named volumes for Prometheus
and Grafana. If a monitoring container is stopped, the first prune removes it
and the second prune can remove the now-unused volume.

**Impact:** Prometheus history and Grafana dashboards/users are lost. They are
intentionally not backed up, so this is unrecoverable.

**Fix:** remove the blanket `volume prune` or restrict it to explicitly
known-disposable volumes. Prefer `podman image prune` and container prune only;
monitoring volumes should be exempt.

### DR-10 - Monitoring unit and environment changes are not applied

**Evidence:** in `ansible/roles/app/tasks/main.yml`, the `unit files` loop
includes monitoring units and notifies `restart stack`; the `environment files`
loop includes `grafana` and also notifies `restart stack`. The `restart stack`
handler only restarts `apps-postgres` through `apps-caddy`. Only the
`monitoring configuration` copy and the alertmanager URL replacement notify
`restart monitoring`.

**Impact:** changing a monitoring image, argument or the Grafana admin password
does not restart the affected container. The deploy reports success while the
old process keeps running.

**Fix:** notify `restart monitoring` for monitoring unit/env changes, or split
the loops so app and monitoring changes have separate handlers. Add a post-deploy
assertion that the running image tag matches the requested tag for every unit.

### DR-11 - Secrets are embedded unquoted in URLs and environment files

**Evidence:** `env-studio.j2`, `env-jublawoma.j2`, `env-unclet.j2` and
`env-zelglihof.j2` put the raw password into `DATABASE_URL`:
`postgres://user:{{ vault_*_database_password }}@postgres:5432/...`. The
templates do not URL-encode or quote values. `env-postgres.j2` and the other
Java templates pass secrets as unquoted `KEY=value` lines. The tasks that render
them have no `no_log`.

**Impact:** a generated password containing `@`, `:`, `/`, `#`, `$`, a space or
a newline breaks the URL or the systemd `EnvironmentFile`; `--diff` runs can
print secrets. The current dev passwords are simple, so this is latent until
production credentials are generated.

**Fix:** use separate user/password variables for the web apps (the database
package already supports a password callback), keep `DATABASE_URL` free of
credentials, URL-encode where a URL is unavoidable, quote environment values,
and add `no_log: true` to secret-rendering/replacement tasks.

### DR-12 - Caddy's 10 MB body limit conflicts with asset limits

**Evidence:** `infrastructure/caddy/Caddyfile` sets
`request_body { max_size 10MB }` for every site route. Assets accepts 20 MiB
images and 50 MiB PDFs, and Studio uploads through a Caddy-routed server
function (`uploadAsset` in `web/sites/studio/src/server/assets.functions.ts`).

**Impact:** valid image and PDF uploads above 10 MB fail at the proxy before
assets can validate them. The service limits are unreachable from Studio.

**Fix:** define a larger per-route body limit for the Studio upload path, or
align the assets and proxy limits deliberately. Keep the small limit for public
forms.

### DR-13 - Image builds are not part of pull-request CI

**Evidence:** `ci.yml` has `web`, `java` and `deployment` jobs; none builds an
image. `publish.yml` builds images only on a version tag (or manual dispatch).

**Impact:** Dockerfile breakage (DR-03), base-image drift and Caddy plugin
breakage surface at release time, after the tag exists. The current assets
failure is the concrete example.

**Fix:** add a no-push image build job to CI (at least the changed images, or the
full matrix on `main`). Build with the same context and Dockerfiles as publish.

### DR-14 - Base images, CI images and the Caddy plugin are not pinned

**Evidence:** `database/Dockerfile` uses `flyway/flyway:13.4.0-alpine` without a
digest. `infrastructure/caddy/Dockerfile` uses `caddy:2.10.0-builder` and
`caddy:2.10.0` without digests, and runs `xcaddy build --with
github.com/caddy-dns/infomaniak` without a plugin version. `ci.yml` uses
`flyway/flyway:13.4.0-alpine`, `quay.io/podman/stable:v5.8.9` and
`python:3.13-alpine` without digests. Actions use major-version tags.

**Impact:** the same commit can build different images or CI results. A
registry tag move or a new Caddy plugin release can break a release without a
repository change.

**Fix:** pin base images by `tag@digest`, pin the Infomaniak plugin version (or
vendor the Caddy build), pin the CI tool images, and pin actions to a commit
SHA where practical. Keep the existing rule: bump tag and digest together.

## P3 - verify or clean up

### DR-15 - The server role assumes `sudo` is installed

`ansible/roles/server/tasks/main.yml` installs packages but not `sudo`;
`ansible.cfg` uses `become_method = sudo`. A minimal Debian image has the
`sudo` group but no `sudo` binary. If the bootstrap user was created without
installing it, every privileged task fails. Add `sudo` to the base packages or
make the prerequisite explicit and verified.

### DR-16 - Monitoring units bind to WireGuard without ordering

`apps-prometheus`, `apps-alertmanager`, `apps-node-exporter` and `apps-grafana`
publish on `{{ monitoring_bind }}` (the WireGuard address) but do not declare
`After=wg-quick@wg0.service` / `Requires=`. On boot they can race the tunnel and
fail their bind, then restart. `site.yml` starts WireGuard first, but a plain
reboot has no such guarantee. Add the ordering or bind to localhost behind a
separate access path.

### DR-17 - Backup and housekeeping schedule variables are ignored

`backup_hour`, `housekeep_hour` and `housekeep_day` exist in
`ansible/group_vars/all.yml`, but the timer units hardcode `03:00:00`,
`Sun *-*-* 04:00:00` and ignore the variables. Either template the timers from
the variables or remove the dead configuration.

### DR-18 - Caddy/blackbox TLS probes may fail behind NAT

`prometheus.yml` probes `https://jublawoma.ch` and the other public names from
inside the host. If the router does not support NAT hairpin, the probes fail
and certificate-expiry coverage is silently absent. Verify after the first
deploy; if needed, probe Caddy internally with a `Host` header.

### DR-19 - `restrict_ssh` is not fully reversible

When `restrict_ssh` is true, the server role writes
`sshd_config.d/60-wireguard.conf`. Setting it back to false does not remove the
file, so SSH stays bound to the tunnel. Add an `else` that removes the file, or
document the manual removal.

### DR-20 - The Grafana volume comment overstates provisioning

`infrastructure/units/data-grafana.volume` says dashboards are reprovisioned
from `infrastructure/monitoring/grafana`, but only the datasource is in the
repository. Dashboards are imported by hand and are lost with the volume.
Correct the comment or provision the dashboards as code.

## What is healthy

- The web build and type checks pass; all four sites build.
- The Maven reactor builds and its tests pass.
- The web, identity, database and Caddy images build. The assets image was the
  only broken Dockerfile and is fixed (DR-03).
- The Ansible playbooks pass syntax checks.
- The dev compose configuration is valid.
- The Quadlet units themselves generate correctly; the CI counter, not the
  units, is the failure.
- The layering and test gates are in good shape; this review is about the
  delivery path, not the application code.

## Recommended fix order

DR-01 to DR-03 are fixed. Continue in this order:

1. DR-04: provision the production roles after migrate.
2. DR-05: fix monitoring directory/file permissions and verify with the real
   image users.
3. DR-06 and DR-07: remove the `latest` default and make Studio's DNS explicit.
4. DR-08 to DR-12: harden backup, housekeeping, monitoring restarts, secrets and
   upload limits.
5. DR-13 and DR-14: build images in CI and pin the remaining inputs.
6. DR-15 to DR-20: clean up the operational edges.

## Live tracking

The P1 items are tracked in
[open work](../work/open-work.md#build-and-deployment-review-2026-11).
Lasting structural debt is in
[technical debt](../work/tech-debt.md) under the `TD-*` entries referenced
above. This review is evidence; the registers are the live checklist.
