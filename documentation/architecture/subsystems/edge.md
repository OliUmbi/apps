# Edge

The public boundary: Caddy and the dynamic-DNS timer. This is the only layer
reachable from the internet.

## Responsibility

Terminate TLS, route each hostname to the owning application, apply baseline
security headers and limits, and keep the managed DNS records pointed at the
current public IP.

## Components

| Component | Runs as | Owns |
| --- | --- | --- |
| caddy | `apps-caddy.service` | certificates and ACME account in `/var/lib/apps/caddy-data`; config in `/var/lib/apps/caddy-config` |
| dyndns | `apps-dyndns.timer` | updating existing Infomaniak A records; never creating or deleting records |

The Caddyfile is baked into the caddy image (`infrastructure/caddy/Dockerfile`),
so a routing or header change ships as a new image tag like every other change.

## Routing

| Public name | Destination |
| --- | --- |
| `jublawoma.ch`, `*.jublawoma.ch` | `jublawoma:8001` |
| `uncle-t.ch`, `*.uncle-t.ch` | `unclet:8002` |
| `zelglihof-maegenwil.ch`, `*.zelglihof-maegenwil.ch` | `zelglihof:8003` |
| `studio.oliumbi.ch` | `studio:8000` |
| `studio.*` and `admin.*` on customer domains | permanent redirect to `studio.oliumbi.ch` |
| `www.*` | permanent redirect to the apex |
| `oliumbi.ch` apex | placeholder redirect to Studio until the Oliumbi site exists |

The old `api.*` style is retired: there are no redirects, and the DNS records
are deleted at cutover. Hostnames are defined in one place,
`infrastructure/caddy/Caddyfile`.

## TLS and DNS

One Infomaniak API token (scopes `domain:read`, `dns:read`, `dns:write`) covers
both jobs: Caddy solves ACME DNS-01 and issues one wildcard certificate per
domain, and the dyndns timer keeps the A records current every 15 minutes. A new
subdomain is covered by the wildcard without touching port 80.

`vpn.oliumbi.ch` is the laptop's WireGuard endpoint, so it survives public-IP
changes. It is managed by the same timer.

## Headers and limits

Every site route inherits:

- compression (`zstd`, `gzip`);
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`;
- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- a 10 MB request-body limit.

Static files under `/assets/*`, `/images/*` and `/fonts/*` get a one-hour cache
default only when the app set no header. Uploaded images under `/api/assets/*`
carry their own `Cache-Control` and `ETag` and always win.

## Exposure model

There is no host firewall, on purpose. The router forwards only TCP 80/443 and
UDP 51820 (WireGuard). Published container ports bypass host firewall rules
anyway, so **what a unit publishes and which address it binds is the exposure
decision**. Admin interfaces bind to the WireGuard address. Nothing except Caddy
publishes a public port.

## Invariants

1. Only Caddy is publicly reachable.
2. Certificates and DNS come from versioned configuration, not host edits.
3. The dyndns timer only updates records listed in `dyndns_records`.
4. `/var/lib/apps/caddy-data` is not deleted casually: it holds the ACME account
   and certificates, and re-issuing hits Let's Encrypt rate limits.
5. App-owned cache headers are never overridden by the proxy.

## Known gaps

- Proxy-level rate limiting is absent; standard Caddy has none. See
  [TD-01](../../work/tech-debt.md#td-01).
- No Content-Security-Policy is sent; the legacy nginx sent one that referenced
  `api.*`. See [TD-02](../../work/tech-debt.md#td-02).
- Static asset caching remains a one-hour default until `public/` files are
  content-hashed. See [TD-03](../../work/tech-debt.md#td-03).
