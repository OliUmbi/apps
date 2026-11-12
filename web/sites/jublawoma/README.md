# jublawoma

The Jubla WOMA public site: promotions, stories, events, members and donations.
It uses `@oliumbi/jublawoma-data` for content, `@oliumbi/assets` for images,
`@oliumbi/analytics` for the anonymous page counter and `@oliumbi/seo` for
metadata. Shared setup, environment and verification are in
[web/README.md](../../README.md).

## Run it

From `web/`:

```powershell
pnpm install
pnpm dev:jublawoma
```

Open <http://localhost:8001>. The database, Flyway and roles services from the
dev compose rig must be running for content-backed pages. A production build is:

```powershell
pnpm --filter jublawoma build
pnpm --filter jublawoma start
```

Smoke check: the home page, one content page and one image load; the analytics
beacon returns `204`.
