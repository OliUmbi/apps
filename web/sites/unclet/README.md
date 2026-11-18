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

## Static images and fonts

Photos in `public/images` are rendered through `StaticImage`
(`src/components/static-image.tsx`): AVIF `srcset` at 480/800/1200/full width,
the JPEG as fallback, explicit `width`/`height` and lazy loading unless the
photo is the page's largest paint. `src/model/images.ts` holds the intrinsic
sizes; add an entry before using a new photo.

URLs carry `?v=<imageVersion>`. Bump it when a photo is replaced in place -
only versioned `/images/*` and `/fonts/*` URLs are cached immutably at the
edge. The sans and mono faces are subset to Latin + German (31/32 KB instead
of 68/70 KB); their `?v=` lives in `src/fonts.css` and must match the preloads
in `src/routes/__root.tsx`.

The one stylesheet is inlined into the SSR document (`inlineCss` in
`vite.config.ts`), which removes a render-blocking request. Regenerate the AVIF
variants after replacing a JPEG:

```powershell
python ../../scripts/optimize-images.py public/images
```
