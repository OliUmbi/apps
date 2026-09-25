# Web applications

Each site owns its routes, page components, styling and public server functions. Studio composes the same site data packages for management. No site imports another site's implementation or tables.

## Boundaries

| Package | Responsibility |
| --- | --- |
| `unclet-data` | Uncle-T showcases, reviews and inquiries |
| `zelglihof-data` | Farm articles, products, reservations, inquiries and newsletter workflows |
| `jublawoma-data` | Club events, stories, members, promotions and donations |
| `database` | Drizzle connections, transaction types, column helpers and pagination |
| `contracts` | Shared validation, site identifiers, links and page contracts |
| `identity` | Typed access to the identity HTTP API |
| `assets` | Typed access to image/document management and public asset URLs |
| `messaging` | Typed access to delivery history and attempts |
| `queue` | Insert one prepared message in the caller's transaction |
| `http-client` | Authentication, HTTP errors, response validation and pagination |
| `query` | React Query provider and shared cache defaults |
| `ui` | Shared rendering and form behavior, including images, Markdown and paginated lists |
| `i18n` | Paraglide configuration, generated runtime and message catalog |
| `environment` | Shared Vite environment loading for local development and builds |

Repositories perform database operations only. Domain services validate inputs, own transactions, and coordinate repositories and queue messages. Email composition and data types live separately. A reservation stores its product snapshot, adjusts stock and queues notifications atomically. Donation commitments lock the requested item and check remaining quantity. Campaign sending locks the campaign, reads confirmed subscribers in batches and queues each email individually.

The generic database package contains no site table names. Studio selects a repository through each site's exported factory. Every application configures a fixed database role independently of its connection URL; a URL specifying another user is rejected. Studio's role does not read identity, assets or messaging tables directly.

Visual components stay under each site's `src/components`. Studio owns its editor, record details, tables, selectors and dialogs. Base UI supplies interactive primitives, Tailwind supplies styling, and TanStack Query handles paginated reads and mutations. Adding a site feature does not require changing another site's UI.

## Source layout

Every public site uses the same small set of source directories:

```text
src/
  components/  visual components named for what they render
  data/        feature-specific reads, mutations and server functions
  model/       public view models and presentation helpers
  routes/      TanStack route definitions and page composition
  server/      runtime infrastructure such as database setup
  fonts.css
  styles.css
```

Studio uses `components/` for workspace views and editors, `hooks/` for client behavior, `model/` for navigation, labels and form contracts, and `server/` for authenticated server functions and service setup. It has no `data/` directory. Its `components/content/` and `server/content/` trees group management features by site.

Components stay flat until a page or feature has several meaningful parts; those parts may share a named folder, as Jublawoma's `components/home` does. Studio's `content` folder specifically means managed site content. Prefer descriptive module imports and avoid extra directory layers that do not express a feature or responsibility.

Data packages use `<feature>.<role>.ts`, such as `donation.repository.ts` and `reservation.service.ts`. Their `public.repository.ts` modules contain public database reads. Each public site's `data/` modules adapt those records to the view models in its own `model/` directory. Studio's editable record contracts live in the owning data package's `content/` modules.

## Implemented application workflows

- Jublawoma: upcoming events, stories and galleries, members, active promotions, donation needs and commitments. Studio manages their source records and reads commitment snapshots.
- Uncle-T: published showcases and galleries, visible reviews, inquiry submission and inquiry management.
- Zelglihof: published articles and galleries, products and variants, stock-aware reservations, contact inquiries, newsletter confirmation/unsubscription, subscriber corrections and campaign sending.
- Studio: schema-specific CRUD, full record details, nested child editors, image selection, image/document uploads and visibility, account management and permissions, and delivery history.

`oliumbi` currently has no content tables or public app in this workspace; Studio exposes its assets only. `studio.account_notification` has no defined event catalog or dispatch contract yet and is not connected to these workflows. Owner notifications currently use the site's configured owner address. These are remaining product capabilities, not substitute tables or fabricated service endpoints.

## Development

Use the pinned pnpm version from `package.json`. Install from `web` with `pnpm install --frozen-lockfile`. Apply the repository's database migrations before running the applications. Supply `DATABASE_URL` without a username plus the site's `*_DATABASE_PASSWORD`, or supply that site's role and password in the URL. Never use the migrator's credentials for a web application.

The checked-in root `.env.development` contains development-only defaults. All four Vite development servers load it automatically, regardless of which site you start. Existing root `.env` values remain a fallback; `.env.development` overrides them. Site-local files override shared values, and shell/IDE environment variables override both. Only `VITE_` variables are exposed to browser code. Restart the dev process after changing environment files, and never reuse the development credentials in a deployed environment.

To run a built Studio locally, execute this from `web/`:

```text
node --env-file=../.env.development sites/studio/.output/server/index.mjs
```

Replace `studio` with another site name as needed. Node loads the shared development file, with shell variables taking precedence; Vite-specific site overrides do not apply. The regular `pnpm --filter studio start` command expects environment variables to be supplied externally. Production builds do not load `.env.development`.

Java does not load `.env.development` automatically and does not implement `APP_ENV_FILE`. Supply variables through the shell or the IDE run configuration, including an IDE environment-file loader if available. See [Java development](../services/README.md#build) for the supported setup.

Use `docker compose --env-file .env.development up -d --build` from the repository root to share these values with containers. Compose sets container-network hostnames separately. For native application development, start only infrastructure with `docker compose --env-file .env.development up -d postgres flyway mailpit`, then launch Java and the desired web apps locally.

Local Java uses `SMTP_HOST=localhost` to reach Mailpit on port 1025. Compose uses `SMTP_CONTAINER_HOST=mailpit` inside its network. Database role passwords must match the migrated database; editing the environment file does not change existing PostgreSQL passwords.

Run `pnpm dev:studio`, `pnpm dev:jublawoma`, `pnpm dev:unclet` or `pnpm dev:zelglihof`. The ports are 8000–8003 respectively.

Studio requires the identity and assets service URLs and their `*_INTERNAL_AUTHORIZATION_TOKEN` values; delivery history also requires the messaging service. Access is granted by `studio.admin` or the corresponding `<site>.manage` permission. Account administration and delivery history require `studio.admin`. No default administrator is created by the web apps.

For hosted environments set `STUDIO_SECURE_COOKIES=true`, the site public URL, owner email addresses, and `ASSETS_SERVICE_URL` (`ASSETS_PUBLIC_URL` is a fallback). Public sites proxy images through their own origin, so the asset service URL may use the internal hostname and can change at runtime without rebuilding the browser bundle.

Paraglide generates its runtime during Vite builds. Source messages are in `packages/i18n/messages/de-CH.json`; generated code is ignored. Only Swiss German is currently configured. English source routes are canonical, without German route wrapper files.

## Verification

From `web`:

```text
pnpm build
pnpm typecheck
pnpm check
```

Build before checking a clean checkout so that route trees and Paraglide output exist. SMTP delivery and the complete deployed stack still need an environment integration pass.
