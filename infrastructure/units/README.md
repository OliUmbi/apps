# Units

Production topology as systemd units (podman Quadlet). This is what the
server runs: one `apps-*.service` per workload, installed to
`/etc/containers/systemd/` by the ansible `app` role. There is no container
daemon and no compose on the server — `compose.dev.yaml` is the workstation
development rig and deliberately not a mirror of this (finding DP-09).

## Layout

| File | Unit | Notes |
| --- | --- | --- |
| `apps.network`, `monitoring.network` | `apps-network.service`, `monitoring-network.service` | bridge networks created by quadlet; service DNS names are the `ContainerName=` values |
| `apps-postgres.container` | `apps-postgres.service` | state in `/var/lib/apps/postgres` (bind mount) |
| `apps-migrate.container` | `apps-migrate.service` | `Type=oneshot` Flyway run before the apps |
| `apps-identity/-messaging/-assets` | same name | Java services on 8081–8083; assets stores media in `/var/lib/apps/media` |
| `apps-jublawoma/-unclet/-zelglihof/-studio` | same name | Nitro SSR sites on 8000–8003 |
| `apps-caddy` | `apps-caddy.service` | the only unit that publishes ports (80/443, 443/udp) |
| `apps-prometheus/-alertmanager/-node-exporter/-blackbox/-grafana` | same name | monitoring; ports bound to `monitoring_bind` (WireGuard) |
| `prometheus-data.volume`, `grafana-data.volume` | — | named volumes for state the backup does not cover |

Files contain Jinja placeholders (`{{ image_tag }}`, `{{ monitoring_bind }}`);
ansible renders them. The `apps-*` unit prefix is load-bearing: the status
playbook and the alert rules match on it.

## Environment

Secrets never live in the units. Each container gets one environment file,
rendered by ansible from the vault (0600 root), named after its unit:
`/etc/default/apps-<service>`. This mirrors the timer units'
`/etc/default/apps-<concern>`. Static wiring (service URLs, ports) is in the
units themselves.

## State and ownership

Everything the backup covers is a plain directory under `/var/lib/apps/`
(`postgres`, `media`, `caddy-data`, `caddy-config`) — backup and restore are
`pg_dump` and `tar` on the host. Deterministic ownership matters because
these are bind mounts: the assets image pins `app` to uid/gid 100 (its
`/media` mount is chowned 100:100), the postgres image runs as uid 70 and
chowns its directory on first start, caddy runs as root.

## Deploy and rollback

`ansible-playbook playbooks/deploy.yml -e image_tag=<tag>` renders the units
with the tag, pulls, and restarts in dependency order (postgres → migrate →
apps → caddy). Rollback is the same command with the previous tag. Images are
pinned: app images by immutable release tag, upstream images by `tag@digest`
(same convention as the Dockerfiles — bump both together).

## Commands

```sh
systemctl status apps-caddy            # one workload
systemctl list-units 'apps-*'          # the whole stack
systemctl restart apps-studio          # restart one workload
journalctl -u apps-studio -n 200       # its logs (journald is the log store)
podman ps                              # container view
podman exec postgres pg_isready        # into a container
```

Ordering caveat: the app units `Require` `apps-migrate`. Re-running migrations
by hand (`systemctl restart apps-migrate`) propagates a stop to the apps —
restart them afterwards, or just use the deploy playbook which does the right
thing.

## Health

Health checks use busybox `wget` (available in every image here — the JRE
alpine images have neither bash nor curl, which broke the old compose health
checks, finding DP-01): `/actuator/health` for the Java services, `/` for the
sites. Status shows in `podman ps`; prometheus probes the same endpoints over
the network via blackbox, and `UnitFailing`/`UnitRestartLoop` alerts watch the
systemd side.

## Debugging unit files

```sh
/usr/lib/systemd/system-generators/podman-system-generator --dryrun
systemd-analyze --generators=true verify apps-studio.service
```
