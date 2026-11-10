# Custom Caddy build with the Infomaniak DNS provider for ACME DNS-01
# challenges and the rate-limit plugin (TD-01). Built by
# .github/workflows/publish.yml as ghcr.io/oliumbi/apps-caddy:<tag>. The
# Caddyfile is baked in so config changes are versioned alongside the code.
# Every build input is pinned (DR-14): base images by digest, the Caddy
# version and the DNS plugin by tag. caddy-ratelimit is pinned to a commit
# because v0.1.0 predates Caddy 2.10 and lacks the config-reload fix; it
# compiles and validates against 2.11.9 (verified 2026-11). The build fails
# if a plugin does not register, instead of surfacing at deploy time.
FROM caddy:2.11.9-builder@sha256:3fddbec729442a56b942d4c9eaef1df80893dbf2cf5b86701bfae6aad1408eeb AS build

RUN xcaddy build v2.11.9 \
    --with github.com/caddy-dns/infomaniak@v1.0.2 \
    --with github.com/mholt/caddy-ratelimit@5625512f24f6f59d6f64fb3aafe5eecff0b286db \
 && caddy list-modules | grep -q dns.providers.infomaniak \
 && caddy list-modules | grep -q http.handlers.rate_limit

FROM caddy:2.11.9@sha256:0c2243efcf437ab7f7a978f1027fcf0d4f9be8a75df27b1b3fbc5dbe0ffa8cf0

COPY --from=build /usr/bin/caddy /usr/bin/caddy
COPY infrastructure/caddy/Caddyfile /etc/caddy/Caddyfile
