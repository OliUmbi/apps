# Edge

The public boundary: Caddy and the dynamic-DNS timer. This is the only layer
reachable from the internet.

## Responsibility

Terminate TLS, route each hostname to the owning application, apply baseline
security headers, CSP, per-client rate limits and body limits, and keep the
managed DNS records pointed at the current public IP.

## Components

| Component | Runs as | Owns |
| --- | --- | --- |
| caddy | `apps-caddy.service` | certificates and ACME account in `/var/lib/apps/caddy-data`; config in `/var/lib/apps/caddy-config` |
| dyndns | `apps-dyndns.timer` | updating existing Infomaniak A records; never creating or deleting records |

The Caddyfile is baked into the caddy image (`infrastructure/caddy/Dockerfile`),
so a routing or header change ships as a new image tag like every other change.
The image itself is pinned by `tag@digest`; the `caddy-ratelimit` plugin is
pinned to a commit because the v0.1.0 tag predates Caddy 2.10 and lacks the
config-reload fix.

## Routing

| Public name | Destination |
| --- | --- |
| `jublawoma.ch` (and non-admin `*.jublawoma.ch`) | `jublawoma:8001` |
| `uncle-t.ch` (and non-admin `*.uncle-t.ch`) | `unclet:8002` |
| `zelglihof-maegenwil.ch` (and non-admin `*.zelglihof-maegenwil.ch`) | `zelglihof:8003` |
| `oliumbi.ch` apex | `oliumbi:8004` (static placeholder) |
| `studio.oliumbi.ch` | `studio:8000` |
| `studio.*` and `admin.*` on customer domains | permanent redirect to `studio.oliumbi.ch` |
| `admin.oliumbi.ch` | permanent redirect to `studio.oliumbi.ch` |
| `www.*` | permanent redirect to the apex |

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
- a baseline Content-Security-Policy: same-origin scripts, styles, fonts and
  connections, inline styles/scripts as the sites currently require,
  `data:`/`blob:` images, `frame-ancestors 'none'` and `object-src 'none'`;
- a 10 MB request-body limit; the Studio host raises this to 51 MB so its
  20 MiB images and 50 MiB PDFs fit.

Rate limits are per client IP. The public zone allows 20 events per 2-second
window (roughly 10 r/s with a burst of 20) and shares one bucket per IPv6 /64 so
cycling addresses does not bypass it. The login zone is stricter and wins on its
path: 10 requests per minute to `/api/session/login`, the dedicated Studio login
route.

Static files under `/assets/*`, `/images/*` and `/fonts/*` get a one-hour cache
default only when the app set no header. Hashed Vite build outputs under
`/assets/` carry a content hash and are cached for a year as immutable.
Uploaded images under `/api/assets/*` carry their own `Cache-Control` and `ETag`
and always win.

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

- Rate limiting, the CSP, hashed-asset caching and the custom image are code
  complete; verify limits, CSP behavior and certificate renewal on the real host
  before trusting a launch.
- The dyndns timer is installed but disabled until cutover, so a parallel host
  cannot change live A records. Enable it explicitly on the cutover run. See
  [ansible/README.md](../../../ansible/README.md).
