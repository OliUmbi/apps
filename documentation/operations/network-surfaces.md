# Network surfaces

What the host and its units listen on, and what is reachable from where. The
router is the outer boundary: there is no host firewall, so a published port and
its bind address decide exposure. Keep this page in step with the units and the
Caddyfile.

## Port scheme

The numbers are a loose family, not a taxonomy. Keep the defaults tools expect
and take the next free port in the matching range for a new service (D33).

| Range | Use |
| --- | --- |
| 80, 443 | public edge (Caddy); 443/udp is HTTP/3 |
| 51820/udp | WireGuard |
| 8000–8004 | web applications: Studio 8000, sites 8001–8004 |
| 8081–8083 | Java HTTP services |
| 3000, 9090, 9093, 9100 | Grafana, Prometheus, Alertmanager, node-exporter (standard) |
| 2019, 9115, 9187 | Caddy admin, blackbox, postgres-exporter (defaults, internal) |
| 5432 | PostgreSQL |
| 1025, 8025 | Mailpit SMTP/UI in development |

A custom 80xx/90xx renumbering was considered and declined: the public surface is
only 80/443/51820, the rest is internal or WireGuard-bound, and renaming working
ports would add deploy risk while breaking tool defaults. See
[D33](../reference/decisions.md#launch-decisions-2026-11).

## Internet (router forwards)

| Port | Proto | Host binding | Purpose |
| --- | --- | --- | --- |
| 80 | TCP | Caddy, all addresses | HTTP: redirect to HTTPS and ACME HTTP fallback |
| 443 | TCP | Caddy, all addresses | HTTPS for every site and Studio |
| 51820 | UDP | `wg-quick`/`wg0` | WireGuard admin tunnel |

The router forwards exactly these three. Everything else is either bound to the
WireGuard address or internal to a container network.

## Host-published, not internet-forwarded

| Port | Proto | Host binding | Reachable from | Purpose |
| --- | --- | --- | --- | --- |
| 22 | TCP | sshd, all addresses | LAN; not forwarded by the router | SSH before `restrict_ssh` |
| 22 | TCP | sshd, WireGuard address only | WireGuard tunnel | SSH after `restrict_ssh: true` |
| 443 | UDP | Caddy, all addresses | LAN only (the router does not forward it) | HTTP/3/QUIC; forward UDP 443 if you want it from the internet |
| 3000 | TCP | Grafana, WireGuard address | WireGuard tunnel | Grafana |
| 9090 | TCP | Prometheus, WireGuard address | WireGuard tunnel | Prometheus UI and queries |
| 9093 | TCP | Alertmanager, WireGuard address | WireGuard tunnel | Alertmanager |
| 9100 | TCP | node-exporter, WireGuard address | WireGuard tunnel | Host metrics scrape/UI |

`monitoring_bind` is the server's WireGuard address (`10.8.0.1`). These ports are
never published on the public address. SSH is LAN-only behind the router even
before lockdown; if the host ever gets a public address directly, treat port 22
as public until `restrict_ssh` is on.

## Container networks

These ports are not host-published. They are reachable only from containers on
the named podman network.

`net-apps`:

| Port | Service |
| --- | --- |
| 5432 | PostgreSQL |
| 8081 | Identity |
| 8082 | Messaging |
| 8083 | Assets |
| 8000 | Studio |
| 8001 | Jublawoma |
| 8002 | Uncle-T |
| 8003 | Zelglihof |
| 8004 | Oliumbi (static) |
| 2019 | Caddy admin/API (internal only) |
| 80, 443 | Caddy (inside the container; published as above) |

`net-monitoring` (Prometheus and blackbox also join `net-apps`):

| Port | Service |
| --- | --- |
| 3000 | Grafana |
| 9090 | Prometheus |
| 9093 | Alertmanager |
| 9100 | node-exporter |
| 9115 | blackbox-exporter |
| 9187 | postgres-exporter |

## Deliberately not exposed

- PostgreSQL `5432` on the host: container network only.
- Identity, messaging, assets and site ports on the host: container network only.
- Caddy admin `2019`: container network only; Prometheus scrapes it internally.
- `apps-migrate`: one-shot, no listener.
- No inbound SMTP: mail is sent outbound to the provider; Mailpit is development
  only.
- No inbound DNS: the host is a DNS client; Caddy talks to the Infomaniak API
  over HTTPS.

## Egress (outbound only)

The host initiates SMTP (587), HTTPS (443) to Infomaniak, ghcr/Docker Hub and
other pinned registries, DNS (53), and NTP (123). The WireGuard tunnel is the
only inbound management path; backups are pulled from the workstation, never
pushed.

## Development only

`infrastructure/compose.dev.yaml` publishes PostgreSQL on `POSTGRES_PORT`
(default 5432), Mailpit on 1025/8025, Identity 8081, Messaging 8082, Assets 8083,
Studio 8000 and the sites 8001–8004 on the workstation's loopback/all
interfaces. These are development surfaces and are not part of the production
host.

## Verify

On the host:

```sh
ss -ltnup                      # every listener and its bind address
podman port --all              # published container ports
wg show                        # tunnel peers and the listen port
```

From outside the LAN, check that only 80/tcp, 443/tcp and 51820/udp answer. From
the workstation, test a public name without changing DNS:

```sh
curl --resolve jublawoma.ch:443:<server-ip> https://jublawoma.ch/
```

If a port appears that is not in this page, the router or a unit changed: update
the unit, the router, or this page before the next deploy.
