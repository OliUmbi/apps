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

## Static images and fonts

Photos under `public/images/people` are rendered through `StaticImage`
(`src/components/static-image.tsx`): AVIF `srcset` at 480/800/1200/full width,
the JPEG as fallback, explicit `width`/`height` and lazy loading unless the
photo is the page's largest paint. `src/model/images.ts` holds the intrinsic
sizes; add an entry before using a new photo.

URLs carry `?v=<imageVersion>`. Bump it when a photo is replaced in place -
only versioned `/images/*` and `/fonts/*` URLs are cached
immutably at the edge.

The doodles and logos in `public/images` are minified SVGs (SVGO); the
favicon is a 3-size ICO. Unused owner material lives in
[`media/jublawoma`](../../../media/jublawoma/README.md) instead of `public/`, so
it is not shipped. The one stylesheet is inlined into the SSR document
(`inlineCss` in `vite.config.ts`), which removes a render-blocking request.

Regenerate the AVIF variants after replacing a JPEG:

```powershell
python ../../scripts/optimize-images.py public/images/people
```
