# External dependencies and versions

The register of everything this repository takes from the outside world, and
where each dependency is pinned. The pin policy is D24 with DR-14: container
images and CI actions pin exact bytes (`tag@digest`, commit SHA or exact
version), a digest change is always a deliberate commit, and the digests are
refreshed monthly (D24; [dependency update
runbook](../operations/runbooks/dependencies.md)).

This page records versions and majors to keep track of. It is the map, not
the mirror: exact ranges and digests live in the owning files below and stay
the source of truth - do not copy them here, or the page goes stale with the
first refresh.

## Toolchain

| Dependency | Version | Pinned in | Notes |
| --- | --- | --- | --- |
| Node.js | 26 | CI `node-version`, `web/package.json` `engines`, site Dockerfiles | Active LTS; CI, engines and site images must stay on one major |
| pnpm | 11 | `web/package.json` `packageManager`; site Dockerfiles install `corepack` explicitly | 12 is available - held as a tooling major, see below |
| JDK | 25 | `services/pom.xml` `java.version`, temurin images | LTS |
| Maven | 3.9.12 | `services/mvnw` wrapper | the wrapper pins it |
| ansible-core | 2.19 | `ci.yml` (pip install) | exact version (DR-14) |

## Container images (external, `tag@digest`)

| Image | Tag | Used by | Owning file(s) |
| --- | --- | --- | --- |
| `node` | 26-alpine3.24 | the five site images | `web/sites/*/Dockerfile` |
| `caddy` | 2.11.9 | edge proxy (custom xcaddy build) | `infrastructure/caddy/Dockerfile` |
| `maven` | 3.9.12-eclipse-temurin-25-alpine | service build stage | `services/*/Dockerfile` |
| `eclipse-temurin` | 25-jre-alpine | service runtime | `services/*/Dockerfile` |
| `postgres` | 18-alpine | server and dev rig | `infrastructure/units/apps-postgres.container`, `compose.dev.yaml` |
| `flyway` | 13.12.1-alpine | migrator | `database/Dockerfile`, `compose.dev.yaml` |
| `mailpit` | v1.29.7 | dev email | `compose.dev.yaml` |
| `prometheus` | v3.16.0 | monitoring | `infrastructure/units/apps-prometheus.container` |
| `alertmanager` | v0.34.2 | monitoring | `infrastructure/units/apps-alertmanager.container` |
| `grafana` | 13.3.0 | monitoring | `infrastructure/units/apps-grafana.container` |
| `node-exporter` | v1.12.1 | monitoring | `infrastructure/units/apps-node-exporter.container` |
| `blackbox-exporter` | v0.29.1 | monitoring | `infrastructure/units/apps-blackbox.container` |
| `postgres-exporter` | v0.19.0 | database statistics | `infrastructure/units/apps-postgres-exporter.container` |
| `trivy` | 0.67.0 | weekly dependency scan | `.github/workflows/{ci,security}.yml` |
| `gitleaks` | v8.28.0 | secret scan | `.github/workflows/{ci,security}.yml` |
| `python` | 3.13-alpine | CI ansible syntax check | `ci.yml` |

The `ghcr.io/oliumbi/apps-*` images are built here from the bases above and
are versioned by the deploy tag (D13); they are not external dependencies.
The dev compose rig pins by tag without digests - it is a workstation tool
(D11), not a deployment surface.

Caddy build inputs are pinned inside
[infrastructure/caddy/Dockerfile](../../infrastructure/caddy/Dockerfile):
the Infomaniak DNS plugin by tag (`v1.0.2`) and caddy-ratelimit by commit
(its `v0.1.0` tag predates Caddy 2.10; replace it when upstream tags
something newer - open work, Later).

## CI actions (commit SHA + version comment)

`actions/checkout` v4, `actions/setup-node` v4, `actions/setup-java` v4,
`pnpm/action-setup` v4, `docker/setup-buildx-action` v3,
`docker/login-action` v3, `docker/metadata-action` v5,
`docker/build-push-action` v6 - each pinned by SHA in
`.github/workflows/`. Bump the SHA and the version comment together.

## Web JavaScript stack

Single source of truth: the `web/pnpm-workspace.yaml` catalog
(`catalogMode: strict`; every site and package references `catalog:`).
Majors in use: React 19, TanStack Start/Router 1, TanStack Query 5, Vite 8,
Tailwind 4, TypeScript 7, zod 4, Biome 2, drizzle-orm 0.45, pg 8,
paraglide-js 3, react-day-picker 10, date-fns 4, `@types/node` 26.

`nitro` is pinned to a release candidate (`3.0.261103-rc`) because TanStack
Start needs it; move to the stable 3.x line when it exists.

## Java stack

Single source of truth: `services/pom.xml` (Spring Boot parent BOM and
properties). Spring Boot 4.1, Java 25, springdoc-openapi 3.2,
metadata-extractor 2.22, twelvemonkeys imageio 3.15, thumbnailator 0.4.21,
lombok 1.18.

## Held upgrades (deliberate, not drift)

| Item | Wait for | Where it lands |
| --- | --- | --- |
| pnpm 12 (12.18 available) | a dedicated tooling pass | `packageManager`, Dockerfile corepack line |
| Spring Boot 4.2 | stable GA (currently RC) | `services/pom.xml` parent |
| nitro stable 3.x | upstream stable release | catalog |
| caddy-ratelimit release tag | upstream tag newer than `5625512f` | caddy Dockerfile; open work, Later |

## Refresh and upgrades

The monthly digest refresh (D24), runtime version bumps and scan handling are the
[dependency update runbook](../operations/runbooks/dependencies.md). The steps are
not repeated here: this page records what is pinned and why, the runbook owns how
to change it.

Held majors are deliberate; the next action for each is in the table above.
