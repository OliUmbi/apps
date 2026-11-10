# Custom Caddy build with the Infomaniak DNS provider for ACME DNS-01
# challenges and the rate-limit plugin (TD-01). Built by
# .github/workflows/publish.yml as ghcr.io/oliumbi/apps-caddy:<tag>. The
# Caddyfile is baked in so config changes are versioned alongside the code.
# Images are pinned tag@digest (DR-14); caddy-ratelimit is pinned to a commit
# because the v0.1.0 tag predates Caddy 2.10 and lacks the config-reload fix.
FROM caddy:2.10.0-builder@sha256:fe8d0d6cdbfd382197c4d715ffd5b41210165e2f64a81ce546ae63eeef35873a AS build

RUN xcaddy build \
    --with github.com/caddy-dns/infomaniak \
    --with github.com/mholt/caddy-ratelimit@5625512f24f6f59d6f64fb3aafe5eecff0b286db

FROM caddy:2.10.0@sha256:133b5eb7ef9d42e34756ba206b06d84f4e3eb308044e268e182c2747083f09de

COPY --from=build /usr/bin/caddy /usr/bin/caddy
COPY infrastructure/caddy/Caddyfile /etc/caddy/Caddyfile
