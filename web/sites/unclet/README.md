# unclet

The Uncle-T public site: services, showcases, reviews and the event inquiry
form. It uses `@oliumbi/unclet-data` for content, `@oliumbi/assets` for images,
`@oliumbi/analytics` for the anonymous page counter and `@oliumbi/seo` for
metadata. Shared setup, environment and verification are in
[web/README.md](../../README.md).

## Run it

From `web/`:

```powershell
pnpm install
pnpm dev:unclet
```

Open <http://localhost:8002>. The database, Flyway and roles services and the
messaging service are required for content and the inquiry flow. Set
`UNCLET_REQUESTS_EMAIL` in the root `.env`. A production build is:

```powershell
pnpm --filter unclet build
pnpm --filter unclet start
```

Smoke check: the home page, one showcase and the inquiry form load; a test
inquiry stores one row and queues the two emails in Mailpit.
