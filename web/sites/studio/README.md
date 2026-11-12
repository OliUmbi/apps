# studio

The shared content and account administration app. It is the only site that
authenticates users and can reach every site's data package. It uses
`@oliumbi/identity` for sessions and accounts, `@oliumbi/assets` for uploads and
`@oliumbi/messaging` for delivery history. Shared setup, environment and
verification are in [web/README.md](../../README.md).

## Run it

From `web/`:

```powershell
pnpm install
pnpm dev:studio
```

Open <http://localhost:8000>. Studio needs the identity and assets services, and
delivery history needs messaging; set their URLs and
`*_INTERNAL_AUTHORIZATION_TOKEN` values in the root `.env`. Access is granted by
`studio.admin` or a site's `<site>.manage` permission; no default administrator
is seeded. `STUDIO_SECURE_COOKIES=true` is set by the production unit.

A production build is:

```powershell
pnpm --filter studio build
pnpm --filter studio start
```

Smoke check: sign in, open one site's content list and one image, and sign out.
