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

## Markdown content

The long-form body fields for Zelglihof articles and products, Unclet showcases
and Jublawoma stories use `MarkdownField`. It offers a small toolbar (bold,
italic, link, H2, H3, `-` list, quote, inline code), a live preview using the
same renderer as the public sites, and a syntax help panel.

The dialect has exactly one form per style: `*bold*`, `_italic_`, backtick
code, `[label](href)`, `##`/`###`, `-` lists, `>` quotes and `---`. HTML,
images, tables, ordered lists and doubled markers are not supported. The full
contract is in [simple markdown](../../../documentation/reference/simple-markdown.md).

Titles, teaser descriptions, promotion copy, review quotes, event short copy
and campaign emails stay plain text. If the public page does not render a field
with `SimpleMarkdown`, do not add markdown tools for it.
