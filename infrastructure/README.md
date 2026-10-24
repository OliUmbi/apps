# infrastructure

Production deployment. Everything here is versioned in git; images come from
ghcr and are pinned by `IMAGE_TAG`, so a deploy is deterministic and a
rollback is deploying the previous tag.

## layout

| path | purpose |
|---|---|
| `compose.prod.yaml` | the app stack (caddy, postgres, migrate, services, sites) |
| `compose.monitoring.yaml` | prometheus, node-exporter, cAdvisor, blackbox, alertmanager, grafana |
| `compose.restore.yaml` | override for the local restore drill (see documentation/operations.md) |
| `monitoring/` | prometheus config, alert rules, alertmanager, grafana provisioning |
| `caddy/Caddyfile` | routing + TLS, baked into the caddy image |
| `caddy/Dockerfile` | caddy + infomaniak DNS-01 plugin + Caddyfile |
| `.env.example` | documented env template (real values: ansible vault, not git) |
| `../database/Dockerfile` | flyway + baked migrations |

There are no bind mounts: the server needs only `compose.prod.yaml` and
`.env`. Put them in `/apps` (the legacy stack used `/projects`).

## deploying

From the workstation (preferred):

```sh
cd ansible
ansible-playbook playbooks/deploy.yml -e image_tag=2026.10.24
```

Manually on the server still works:

```sh
cd /apps
IMAGE_TAG=2026.10.24 docker compose --env-file .env up -d
```

Rollback: same command with the previous tag. `migrate` runs first and
everything else waits for it (`service_completed_successfully`).

## routing

Public names (see `caddy/Caddyfile`):

- `jublawoma.ch`, `uncle-t.ch`, `zelglihof-maegenwil.ch` → site containers
- `studio.oliumbi.ch` → studio; every other `studio.*`/`admin.*` name
  permanent-redirects there so sessions survive
- `www.*` → apex redirect. The old `api.*` names are retired: no redirects,
  delete the DNS records at cutover.
- `oliumbi.ch` apex: **TODO** (no site container in the new stack yet)

## notes

- `caddy-data` holds the ACME account + certificates. Deleting the volume
  means re-issuing everything: do not delete it casually (Let's Encrypt rate
  limits).
- One Infomaniak API token (scopes `domain:read`, `dns:read`, `dns:write`)
  covers everything DNS: ACME DNS-01 in caddy and the dyndns timer
  (`ansible/files/dyndns.sh`) that keeps the A records on the dynamic IP.
- Log rotation (`json-file`, 10m x 3) is set per service and in
  `/etc/docker/daemon.json`; housekeeping prunes old images weekly.
- Day-to-day operations (deploy, backups, logging, monitoring) are documented
  in [documentation/operations.md](../documentation/operations.md). Ansible
  drives all of it from `../ansible/`.
