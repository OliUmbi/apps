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

Copy the root `.env.example` to `.env` once and adjust it for your local database. This file is ignored by Git. All four Vite configurations load it automatically, regardless of which site you start. Mode-specific root files (such as `.env.development`) and site-local files are supported; site values override shared values, and shell/IDE environment variables override both. Only `VITE_` variables are exposed to browser code. Restart the dev process after changing environment files. The site `start` scripts also load the root `.env` using Node's native environment-file support.

The Java services import `.env` from their working directory. In IntelliJ, set the working directory to the repository root, or set `APP_ENV_FILE` to its absolute `.env` path. Keep shared file values unquoted, as Java reads it as properties. Existing run-configuration environment variables take precedence. When using Maven from the `services` directory, set `APP_ENV_FILE=../.env`.

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
pnpm test
```

Build before checking a clean checkout so that route trees and Paraglide output exist. Integration tests additionally require `TEST_DATABASE_URL` for a disposable PostgreSQL database whose name ends in `_test`, with all migrations applied. They create test records and must never target application data. Without this variable, the database test is explicitly skipped.

Tests cover role enforcement, HTTP contracts, queue boundaries, schema compatibility, reservation/donation concurrency, publication visibility, CRUD, newsletter consent/cooldown and concurrent campaign sends. Browser verification used an isolated migrated database and local identity/assets/messaging fixtures. The identity and assets clients were also tested against running Java services and isolated storage. Set `TEST_IDENTITY_URL` and `TEST_ASSETS_URL` to local disposable services to run those opt-in tests. SMTP delivery and the complete deployed stack still need an environment integration pass.
