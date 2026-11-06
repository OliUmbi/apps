# infrastructure

Runtime configuration and production deployment. Everything here is versioned
in git; images come from ghcr and are pinned by tag, so a deploy is
deterministic and a rollback is deploying the previous tag.

## layout

| path | purpose |
|---|---|
| `units/` | production topology: systemd units (podman Quadlet) — see `units/README.md` |
| `monitoring/` | prometheus config, alert rules, alertmanager, grafana provisioning |
| `caddy/Caddyfile` | routing + TLS, baked into the caddy image |
| `caddy/Dockerfile` | caddy + infomaniak DNS-01 plugin + Caddyfile |
| `compose.dev.yaml` | the local development stack (Docker Desktop) |
| `.env.dev` | template for the local `.env` at the repository root |
| `../database/Dockerfile` | flyway + baked migrations |

Production values are not in this directory: ansible renders the units with
the deploy tag and the per-service `/etc/default/apps-*` environment files
from the vault (`../ansible/roles/app/templates/`).

## deploying

From the workstation:

```sh
cd ansible
ansible-playbook playbooks/deploy.yml -e image_tag=2026.10.24
```

This renders `units/` into `/etc/containers/systemd/`, pulls the images, and
restarts the stack in dependency order (postgres → migrate → apps → caddy).
Rollback: same command with the previous tag. The app units `Require`
`apps-migrate`, so migrations always run first. There is no compose and no
container daemon on the server.

## routing

Public names (see `caddy/Caddyfile`):

- `jublawoma.ch`, `uncle-t.ch`, `zelglihof-maegenwil.ch` → site containers
- `studio.oliumbi.ch` → studio; every other `studio.*`/`admin.*` name
  permanent-redirects there so sessions survive
- `www.*` → apex redirect. The old `api.*` names are retired: no redirects,
  delete the DNS records at cutover.
- `oliumbi.ch` apex: **TODO** (no site container in the new stack yet)

## notes

- `/var/lib/apps/caddy-data` holds the ACME account + certificates. Deleting
  it means re-issuing everything: do not delete it casually (Let's Encrypt
  rate limits).
- One Infomaniak API token (scopes `domain:read`, `dns:read`, `dns:write`)
  covers everything DNS: ACME DNS-01 in caddy and the dyndns timer
  (`ansible/files/dyndns.sh`) that keeps the A records on the dynamic IP.
- Logging: everything goes to journald (capped at 200M); housekeeping prunes
  images older than a week, keeping rollback candidates.
- Day-to-day operations (deploy, backups, logging, monitoring) are documented
  in [documentation/operations.md](../documentation/operations.md). Ansible
  drives all of it from `../ansible/`.
