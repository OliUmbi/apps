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

## Static images

Owner photos live in `public/images` as the original JPEG plus generated AVIF
variants at 480/800/1200/full width (for example
`spinat-beregnung-800.avif`). Always render them through `StaticImage`
(`src/components/static-image.tsx`): it emits a `<picture>` with an AVIF
`srcset`, an explicit `width`/`height` for layout stability, lazy loading by
default and `fetchpriority="high"` for the one photo that carries the page.

- The intrinsic sizes live in `src/model/images.ts`; add an entry there before
  using a new photo.
- URLs carry `?v=<imageVersion>`. Bump `imageVersion` whenever a photo is
  replaced in place - `/images/*` and `/fonts/*` are cached immutably at the
  edge, but only when the request carries a version query.
- `public/fonts/sans-geist.woff2` is subset to Latin + German (31 KB instead
  of 68 KB); its `?v=` lives in `src/fonts.css` and must match the preload in
  `src/routes/__root.tsx`.
- Prominent photos also get `imagePreload(...)` in the route `head`, so the
  browser starts the fetch before it has parsed the markup.
- `public/images/noise.webp` is the body grain tile; it replaced an inline
  `feTurbulence` filter that was re-rasterised for the whole viewport.

Regenerate the AVIF variants after replacing a JPEG (Pillow with AVIF support):

```powershell
python scripts/optimize-images.py
```
