# Simple Markdown

Long-form content in Studio uses a deliberately small markdown dialect. It is
not CommonMark and it is not configurable per site: one syntax per style, one
renderer, no HTML.

The implementation is split by layer:

| Layer | Location |
| --- | --- |
| Parser, syntax types and plain-text projection | `web/packages/contracts/src/simple-markdown.ts` |
| React renderer | `web/packages/ui/src/simple-markdown.tsx` (`@oliumbi/ui/simple-markdown`) |
| Studio editor | `web/sites/studio/src/components/content/markdown-field.tsx` |
| Security tests | `web/tests/security-boundaries.test.ts` |

## Syntax

| Result | Source |
| --- | --- |
| Bold | `*fett*` |
| Italic | `_kursiv_` |
| Inline code | `` `Code` `` |
| Link | `[Text](https://example.ch)` |
| Heading 2 | `## Überschrift` |
| Heading 3 | `### Überschrift` |
| Unordered list | `- Punkt` |
| Quote | `> Zitat` |
| Divider | `---` |

There is exactly one marker per style. `**bold**`, `__italic__`, `*` list
bullets and `1.` ordered lists are not a second syntax; they remain literal
text. The parser intentionally has no image, table, fenced-code or nested-list
syntax.

### Newlines

- One newline stays a line break inside the current paragraph.
- A blank line closes the paragraph and starts a new block.
- Headings, lists, quotes and rules start their own block.

## Security boundary

The parser returns React nodes, never HTML. The renderer never uses
`dangerouslySetInnerHTML`.

- HTML (`<b>`, `<script>`, …) is literal text.
- Links pass through `safeLinkHref`: same-page `#`, relative `/`, `http(s)` and
  `mailto` only. `javascript:`, `data:` and other schemes are not emitted as
  links.
- There is no link auto-detection; only the explicit `[label](href)` form is a
  link.
- The server stores source text only; the renderer is the security boundary.

## Heading rule

The page title is the page's only H1. Body content should use H2 and H3. The
Studio toolbar offers only H2/H3, and the dialect documentation does not
present `#` as an authoring option. The parser still accepts H1 for legacy
source, but the preview makes a duplicate H1 visible.

## Where it is used

| Surface | Field | Renderer class |
| --- | --- | --- |
| Zelglihof articles | `zelglihof.article.body` | `.farm-markdown` |
| Zelglihof product detail | `zelglihof.product.body` | `.farm-markdown.product-markdown` |
| Unclet showcases | `unclet.showcase.body` | `.unclet-markdown` |
| Jublawoma stories | `jublawoma.story.body` | `.markdown-content` |

Studio uses `MarkdownField` for those four body fields: a small toolbar
(bold, italic, link, H2, H3, list, quote, code), a preview using the same
renderer, and a syntax help panel.

Short copy is not markdown and stays in the existing `TextField`:

- titles, names, locations, authors, contacts, links and slugs
- teaser `description` fields used by cards, meta descriptions, SEO and
  structured data
- promotion copy, review quotes and event short descriptions
- campaign email bodies (plain-text email)
- static legal/privacy/terms copy

The rule is simple: **if the public page does not render a field with
`SimpleMarkdown`, Studio must not offer markdown tools for it.**

## Excerpts and metadata

Use `markdownToPlainText` for anything that needs the text behind a body:
teasers, meta descriptions or structured data. It keeps link labels and strips
markers. Unclet's showcase list uses it for the teaser excerpt.

Do not use a second regex to strip markdown; it drifts from the parser.

## Content migration

The dialect is pre-launch and has one form per style. Existing bodies that use
`**bold**`, `*italic*` or ordered lists should be converted to `*bold*`,
`_italic_` and `-` lists before publishing. They still render safely, but the
old markers appear literally. When importing legacy content, add a conversion
step outside the renderer rather than keeping a second syntax alive.
