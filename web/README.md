# Web applications

Each site owns its routes, page components, styling and public server functions. Studio composes the same site data packages for management. No site imports another site's implementation or tables.

## Boundaries

| Package | Responsibility |
| --- | --- |
| `unclet-data` | Uncle-T showcases, reviews and inquiries |
| `zelglihof-data` | Farm articles, products, reservations, inquiries and newsletter workflows |
| `jublawoma-data` | Club events, stories, members, promotions and donations |
| `database` | Connections, transactions and generic parameterized CRUD helpers |
| `contracts` | Generic validation and resource metadata types |
| `identity` | Typed access to the identity HTTP API |
| `assets` | Typed access to image/document management and public asset URLs |
| `messaging` | Typed access to delivery history and attempts |
| `queue` | Insert one prepared message in the caller's transaction |
| `http-client` | Authentication, HTTP errors, response validation and pagination |
| `query` | React Query provider and shared cache defaults |
| `i18n` | Paraglide configuration, generated runtime and message catalog |
| `environment` | Shared Vite environment loading for local development and builds |

Repositories perform database operations only. Domain services validate inputs, own transactions, and coordinate repositories and queue messages. Email composition and data types live separately. A reservation stores its product snapshot, adjusts stock and queues notifications atomically. Donation commitments lock the requested item and check remaining quantity. Campaign sending locks the campaign, reads confirmed subscribers in batches and queues each email individually.

The generic database package contains no site table names. Studio selects a repository through each site's exported factory. Every application configures a fixed database role independently of its connection URL; a URL specifying another user is rejected. Studio's role does not read identity, assets or messaging tables directly.

Visual components stay under each site's `src/components`. Studio owns its editor, record details, tables, selectors and dialogs. Base UI supplies interactive primitives, Tailwind supplies styling, and TanStack Query handles paginated reads and mutations. Adding a site feature does not require changing another site's UI.

## Implemented application workflows

- Jublawoma: upcoming events, stories and galleries, members, active promotions, donation needs and commitments. Studio manages their source records and reads commitment snapshots.
- Uncle-T: published showcases and galleries, visible reviews, inquiry submission and inquiry management.
- Zelglihof: published articles and galleries, products and variants, stock-aware reservations, contact inquiries, newsletter confirmation/unsubscription, subscriber corrections and campaign sending.
- Studio: schema-specific CRUD, full record details, image and parent-record selection, image/document uploads and visibility, account management and permissions, and delivery history.

`oliumbi` currently has no content tables or public app in this workspace; Studio exposes its assets only. `studio.account_notification` has no defined event catalog or dispatch contract yet and is not connected to these workflows. Owner notifications currently use the site's configured owner address. These are remaining product capabilities, not substitute tables or fabricated service endpoints.

## Development

Use the pinned pnpm version from `package.json`. Install from `web` with `pnpm install --frozen-lockfile`. Apply the repository's database migrations before running the applications. Supply `DATABASE_URL` without a username plus the site's `*_DATABASE_PASSWORD`, or supply that site's role and password in the URL. Never use the migrator's credentials for a web application.

The checked-in root `.env.development` contains development-only defaults. All four Vite development servers load it automatically, regardless of which site you start. Existing root `.env` values remain a fallback; `.env.development` overrides them. Site-local files override shared values, and shell/IDE environment variables override both. Only `VITE_` variables are exposed to browser code. Restart the dev process after changing environment files, and never reuse the development credentials in a deployed environment.

Run a built site locally with `pnpm --filter studio start:dev` (or another site name). This uses Node's native loader for the same root `.env.development`, with shell variables taking precedence. `start:dev` loads only that shared file; Vite-specific site overrides do not apply. The regular `start` command uses the deployment's environment. Production builds do not load `.env.development`.

Java automatically finds the repository root from its working directory and loads `.env.development` through the shared library. Rebuild Java after pulling this change. Remove the old IntelliJ env-file link and `APP_ENV_FILE` override to use discovery; an explicit `APP_ENV_FILE` still selects an alternate file. Shell/IDE values take precedence. Keep shared values unquoted, without interpolation, and use forward slashes in paths because Java reads the file as UTF-8 properties.

Use `docker compose --env-file .env.development up -d --build` from the repository root to share these values with containers. Compose sets container-network hostnames separately. For native application development, start only infrastructure with `docker compose --env-file .env.development up -d postgres flyway mailpit`, then launch Java and the desired web apps locally.

Local Java uses `SMTP_HOST=localhost` to reach Mailpit on port 1025. Compose uses `SMTP_CONTAINER_HOST=mailpit` inside its network. Database role passwords must match the migrated database; editing the environment file does not change existing PostgreSQL passwords.

Run `pnpm dev:studio`, `pnpm dev:jublawoma`, `pnpm dev:unclet` or `pnpm dev:zelglihof`. The ports are 8000–8003 respectively.

Studio requires the identity and assets service URLs and their `*_INTERNAL_AUTHORIZATION_TOKEN` values; delivery history also requires the messaging service. Access is granted by `studio.admin` or the corresponding `<site>.manage` permission. Account administration and delivery history require `studio.admin`. No default administrator is created by the web apps.

For hosted environments set `STUDIO_SECURE_COOKIES=true`, the site public URL, owner email addresses, and `ASSETS_PUBLIC_URL`. Browser asset URLs use `VITE_ASSETS_PUBLIC_URL` at build time; Compose passes `ASSETS_PUBLIC_URL` into that build argument. Rebuild when changing that URL.

Paraglide generates its runtime during Vite builds. Source messages are in `packages/i18n/messages/de-CH.json`; generated code is ignored. Only Swiss German is currently configured. English source routes are canonical, without German route wrapper files.

## Verification

From `web`:

```text
pnpm build
pnpm typecheck
pnpm check
```

Build before checking a clean checkout so that route trees and Paraglide output exist. SMTP delivery and the complete deployed stack still need an environment integration pass.
