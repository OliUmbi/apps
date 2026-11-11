# infrastructure

Runtime configuration and production deployment. Everything here is versioned
in git. Application images come from ghcr and are pinned by an explicit release
tag. Production and CI images and build inputs are pinned by `tag@digest` where
applicable (Caddy, Flyway, podman, Python and PostgreSQL), so a deploy is
deterministic and a rollback is deploying the previous tag. `image_tag` has no
default and `latest` is rejected.

## layout

| path | purpose |
|---|---|
| `units/` | production topology: systemd units (podman Quadlet) — see `units/README.md` |
| `monitoring/` | prometheus config, alert rules, alertmanager, grafana provisioning |
| `caddy/Caddyfile` | routing + TLS, rate limits, CSP, caching and body limits; baked into the caddy image |
| `caddy/Dockerfile` | pinned caddy base + infomaniak DNS-01 plugin + pinned caddy-ratelimit commit + Caddyfile |
| `compose.dev.yaml` | the local development stack (Docker Desktop) |
| `.env.dev` | template for the local `.env` at the repository root |
| `../database/Dockerfile` | flyway + baked migrations |

Production values are not in this directory: ansible renders the units with
the deploy tag and the per-service `/etc/default/apps-*` environment files
from the vault (`../ansible/roles/app/templates/`).

## deploying

Production deploy, rollback and the verification checklist are the
[release runbook](../documentation/operations/runbooks/release.md).
`image_tag` is required and `latest` is rejected. The app role renders `units/`
into `/etc/containers/systemd/`, pulls the images, provisions the seven
application roles and the read-only `monitoring` role from the vault, and starts
the stack in dependency order. `oliumbi` stays `NOLOGIN` because the site is
static. There is no compose and no container daemon on the server.

## routing

Public names (see `caddy/Caddyfile`):

- `jublawoma.ch`, `uncle-t.ch`, `zelglihof-maegenwil.ch` → site containers
- `oliumbi.ch` apex → `oliumbi:8004`, the static English placeholder
- `studio.oliumbi.ch` → studio; every other `studio.*`/`admin.*` name
  permanent-redirects there so sessions survive
- `www.*` → apex redirect. The old `api.*` names are retired: no redirects,
  delete the DNS records at cutover.

Every site response carries the baseline CSP, HSTS and the other security
headers. Per-client rate limits are 20 events per 2-second window publicly
(roughly 10 r/s, burst 20; IPv6 per /64) and 10 per minute on
`/api/session/login`. Body limits are 10 MB on public sites and 55 MB on the
Studio host. Hashed Vite assets under `/assets/` are immutable for a year;
unhashed `public/` files keep a one-hour default. See
[edge](../documentation/architecture/subsystems/edge.md) and the complete
[network surfaces](../documentation/operations/network-surfaces.md).

## notes

- `/var/lib/apps/caddy-data` holds the ACME account + certificates. Deleting
  it means re-issuing everything: do not delete it casually (Let's Encrypt
  rate limits).
- One Infomaniak API token (scopes `domain:read`, `dns:read`, `dns:write`)
  covers everything DNS: ACME DNS-01 in caddy and the dyndns timer
  (`ansible/files/dyndns.sh`) that keeps the A records on the dynamic IP. The
  timer is installed but disabled by default before cutover; enable it
  explicitly on the cutover run.
- The backup and housekeeping timers are templated (time and day come from
  Ansible variables), not hard-coded in the unit files. Housekeeping never
  prunes named volumes: monitoring state is intentionally outside the backup.
- Monitoring TLS probes run inside the app network against Caddy with the public
  hostname as SNI and Host, so they do not depend on NAT hairpin.
- Logging: everything goes to journald (capped at 200M); housekeeping prunes
  images older than a week, keeping rollback candidates.
- Day-to-day operations (deploy, backups, logging, monitoring) are documented
  in [documentation/operations/README.md](../documentation/operations/README.md);
  the runbooks own the procedures and [network surfaces](../documentation/operations/network-surfaces.md)
  lists every listener. Ansible drives all of it from `../ansible/`.
