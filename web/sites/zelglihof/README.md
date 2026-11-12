# zelglihof

The Zelglihof public site: farm, products, reservations, newsletter and contact
inquiries. It uses `@oliumbi/zelglihof-data` for content and workflows,
`@oliumbi/assets` for images, `@oliumbi/analytics` for the anonymous page counter
and `@oliumbi/seo` for metadata. Shared setup, environment and verification are
in [web/README.md](../../README.md).

## Run it

From `web/`:

```powershell
pnpm install
pnpm dev:zelglihof
```

Open <http://localhost:8003>. The database, Flyway and roles services and the
messaging service are required for content, reservations and email. Set
`ZELGLIHOF_REQUESTS_EMAIL` and `ZELGLIHOF_NEWSLETTER_EMAIL` in the root `.env`.
A production build is:

```powershell
pnpm --filter zelglihof build
pnpm --filter zelglihof start
```

Smoke check: a product page and the contact form load; a reservation decrements
stock once and queues the confirmation and admin emails in Mailpit.
