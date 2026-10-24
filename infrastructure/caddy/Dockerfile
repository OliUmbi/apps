# Custom Caddy build with the Infomaniak DNS provider for ACME DNS-01
# challenges. Built by .github/workflows/publish.yml as
# ghcr.io/oliumbi/apps-caddy:<tag>. The Caddyfile is baked in so config
# changes are versioned alongside the code.
FROM caddy:2.10.0-builder AS build

RUN xcaddy build \
    --with github.com/caddy-dns/infomaniak

FROM caddy:2.10.0

COPY --from=build /usr/bin/caddy /usr/bin/caddy
COPY Caddyfile /etc/caddy/Caddyfile
