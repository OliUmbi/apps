# Refactoring handoff — public web sites (jublawoma, unclet, zelglihof)

Executed in the 2026-10 refactoring pass; see `refactoring-plan.md` for outcomes. The registry below is historical.

> Machine-oriented handoff document. Produced by a static review of the three public
> sites and shared web packages (2026-10-25). Purpose: let an orchestrating agent
> dispatch parallel subagents to execute the refactor without write collisions and
> without re-litigating findings.
>
> **Dedup protocol with other reports:** other review sessions cover overlapping
> ground. This registry is canonical for IDs `X-*` (cross-cutting), `J-*`
> (jublawoma), `U-*` (unclet), `Z-*` (zelglihof). When merging other reports, match
> findings by evidence `path:line`, not by wording. Do not renumber. If two reports
> disagree on severity, take the higher one. If a finding here is already fixed in
> the tree at execution time, drop it silently; everything else is assumed open.

---

## 1. Scope

**In scope (refactor lanes may write):**

| Area | Paths |
| --- | --- |
| Site sources | `web/sites/jublawoma/src/**`, `web/sites/unclet/src/**`, `web/sites/zelglihof/src/**` |
| Shared UI/contracts | `web/packages/ui/src/**`, `web/packages/contracts/src/**` |
| Site data packages (only via D-tasks) | `web/packages/jublawoma-data/src/**`, `web/packages/unclet-data/src/**`, `web/packages/zelglihof-data/src/**` |
| Message catalog (serialized writes only) | `web/packages/i18n/messages/de-CH.json` |
| Docs (last phase only) | `documentation/*.md` |

**Out of scope (do not write):** `web/sites/studio/**` (separate review session),
`services/**` (Java), `infrastructure/**`, `ansible/**`, `database/**` except
task D2 which explicitly adds one migration, `legacy/**`, all generated files
(`routeTree.gen.ts`, `.output/**`, `node_modules/**`, `.dependencies-before-rework/**`).

**Constraint:** studio consumes `@oliumbi/ui` and `@oliumbi/contracts`. Shared API
changes must be **additive or must keep studio type-checking and building**. After
any shared-package change, run studio's check/build even though studio is not edited.

---

## 2. Invariants — preserve these (from `documentation/principles.md`, `code-quality-review.md` "Keep these choices")

1. One-way layering: `routes/*` → `components/*` → `data/*` (server functions) → `packages/*-data`. No component imports a route. No cycles.
2. One Zod schema shared between client and server for every public form, with server-side re-validation at the service boundary. Errors are values (`{ outcome: … }`), not throws.
3. Transactions + row locks for stock (zelglihof reservations) and donation capacity (jublawoma). The server, not the form's `max`, is the source of truth.
4. Site-specific wording, layout and branding stay in the site. Share behavior in `@oliumbi/ui` only where it is already shared. Do not build a universal component layer; similar markup across sites is not a defect.
5. CSS classes that anchor descendant selectors, style markdown-rendered HTML, or depend on media-query source order stay in plain CSS. Convert only repeated flat utility strings (see §6).
6. `styles.css` keeps a comment explaining why remaining custom classes exist. Update these comments when classes are added/removed — two are already stale (see X-09).
7. Accessibility, responsive behavior, per-route metadata and error states are part of the feature, not polish.
8. Existing accessibility wins stay: `prefers-reduced-motion` blocks, `role="alert"`/`role="status"` feedback, `:has(input:focus-visible)` rating outlines, `MediaImage` seeded-doodle fallback with `role="img"` + `aria-label`, jublawoma's deterministic date rendering (pinned `de-CH` locale + explicit timezone + midday anchor).

---

## 3. Findings registry

Severity: **P1** = fix before launch / visible defect · **P2** = correctness or maintainability gap, fix in this refactor · **P3** = smaller cleanup, fix when touched.

Status of prior findings (`documentation/code-quality-review.md`), verified at review time:
R20 open (X-02) · R21 open (X-03) · R24 open in zelglihof, resolved in jublawoma (D1) ·
R28 open and regressed (X-01) · R29 mostly fixed, residues in J-list query, U-07, Z-18 ·
R02 (decimal precision) still applies to jublawoma donation quantities (J-13 notes the UX side; the arithmetic fix is decision-gated in D2).

### 3.1 Cross-cutting (all sites / shared packages)

| ID | P | Finding | Evidence | Fix |
| --- | --- | --- | --- | --- |
| X-01 | 1 | `PaginatedList` emits class `shell` which **no site defines**; empty state, error text and "load more" render unstyled on all paginated pages. R28's premise ("supplied by consumers") is wrong in the current tree. | `web/packages/ui/src/paginated-list.tsx:12,34,39`; no `.shell` in any `styles.css`; consumers: `jublawoma/src/routes/{events.tsx,stories.index.tsx}`, `unclet/src/routes/showcases.index.tsx`, `zelglihof/src/routes/{products.index.tsx,latest.index.tsx}` | A1 + per-site B tasks |
| X-02 | 2 | R20 open: `SubmissionField.name: string`, `numberFields: readonly string[]`, `defaults: Record<string, unknown>` untyped against the schema; renamed fields silently break. Form trio (`submission-form.tsx`, `submission-control.tsx`, `input-field.tsx`) duplicated in 3 sites, already drifted. | `*/src/components/submission-control.tsx:6`, `web/packages/ui/src/use-submission-form.ts:16,54-65` | A2 + per-site C tasks |
| X-03 | 2 | R21 open: all Zod issues collapse to `m.required()` = "Bitte prüfe deine Angaben." No field attribution, no `aria-invalid`, no focus management. `Field.Error` only surfaces native validity; select/rating branches have no error slot at all. | `web/packages/ui/src/use-submission-form.ts:30-40`, `web/packages/i18n/messages/de-CH.json:171` | A2 |
| X-04 | 2 | No abuse resistance on any public mutation (honeypot, throttle, rate limit). Matches open work "Add rate limits for login, inquiries, reviews and newsletter requests". Jublawoma worst: every spam commit decrements visible campaign stock. | `jublawoma/src/data/donations.ts:8-10`, `unclet/src/data/inquiries.ts:11-13`, `unclet/src/data/reviews.ts:12-17`, `zelglihof/src/data/reservations.ts:11`, `zelglihof/src/data/contact.ts:11` | D3 |
| X-05 | 2 | Retried submissions duplicate business writes: fresh UUID per reservation, no submission identity for donation commitments. Lost response + resubmit = double commit / double stock decrement. Matches open work "Prevent duplicate reservations and donation commitments after retries". | `zelglihof-data/src/reservation.service.ts:17`, `jublawoma-data/src/donation.repository.ts:43-59` | D2 (decision-gated) |
| X-06 | 2 | Per-route metadata missing on detail pages: identical root title/description everywhere, no `og:image` despite cover images. | `jublawoma/src/routes/stories.$slug.tsx`, `unclet/src/routes/showcases.$slug.tsx:8-17`, `zelglihof/src/routes/{products.index.tsx,products.$productId.tsx,latest.index.tsx,latest.$slug.tsx}` | C1/C2/C3 |
| X-07 | 3 | Malformed IDs/slugs hit the generic error page instead of the branded 404: strict `z.uuid()`/`slugSchema` fail inside the serverFn validator before `notFound()` runs. | `unclet/src/data/showcases.ts:53`, `zelglihof/src/routes/products.$productId.tsx:10-11`, `zelglihof/src/routes/latest.$slug.tsx:7-8`, `contracts/src/validation.ts:14,32-35` | C2/C3 |
| X-08 | 3 | Module-scope `m.*()` calls freeze locale at import time (latent with one locale, breaks with two). | `unclet/src/components/header.tsx:7-11`, `zelglihof/src/components/shop-empty-state.tsx:4-11`, `zelglihof/src/components/crops/crop-mosaic.tsx:11-71` | C2/C3 |
| X-09 | 3 | Stale documentation/comments: `code-quality-review.md` R27 claims a jublawoma `page-title-accent` class that exists nowhere; R28 describes `shell` as consumer-supplied; jublawoma `styles.css:52-81` claims `.shell` "is used on 29 wrappers" (0 usages). | `documentation/code-quality-review.md:183`, `:189`, `web/sites/jublawoma/src/styles.css:54` | B1 + D-docs |
| X-10 | 3 | `FormFeedback` success style uses Tailwind default `emerald-500`, off-brand on all three sites. | `web/packages/ui/src/form-feedback.tsx:21` | A2 (fold-in) |

### 3.2 Jublawoma (`web/sites/jublawoma`)

| ID | P | Finding | Evidence | Fix |
| --- | --- | --- | --- | --- |
| J-01 | 2 | Undefined CSS classes in JSX. `button-row` is load-bearing (CTA layout in the contact card currently flows inline). `join-hero`, `about-hero`, `donation-item-list` are dead markers. | `routes/join.tsx:9,47`, `routes/about.tsx:10`, `components/donation-campaign.tsx:32` | B1 |
| J-02 | 3 | Dead code: `submission-control.tsx:24-54` Select branch unreachable (only form uses no options); `components/asset-image.tsx:1` one-line re-export whose consumers get a different fallback than `MediaImage`; `PublicEvent.description` (`data/events.ts:14`, `model/content.ts:27`) rendered nowhere. | as listed | C1 |
| J-03 | 3 | Hardcoded German bypasses i18n; `donation-item-card.tsx:25-27` splits phrase `"von {quantity} {unit} …"` across literal and message (untranslatable word order). Also `not-found.tsx:9` `"404 · Verirrt"`, `public-members.tsx:92` `" · "`. | as listed | C1 |
| J-04 | 2 | Document/contact URLs duplicated across files: `Anmeldung-Jubla-Woma.pdf` ×3 (`header.tsx:57,79`, `join.tsx:54`), `scharleitung@jublawoma.ch` ×3 (`footer.tsx:19`, `join.tsx:48`, `legal.tsx:24`), Instagram URL ×2. | as listed | C1 (one `src/model/links.ts`) |
| J-05 | 3 | Form trio duplicated across sibling sites (all nine files byte-different). Covered by X-02; listed for per-site adoption. | `components/{submission-form,submission-control,input-field}.tsx` | C1 (adopt A2) |
| J-06 | 3 | `model/` split uneven; two date conventions: donations use `timeZone: "Europe/Zurich"` (`model/donations.ts:27`), events use UTC + midday anchor (`model/dates.ts:1-10`). | as listed | C1 (one formatting module, one documented policy) |
| J-07 | 2 | Client-side fetching breaks the top-down loader pattern: `home/promotions.tsx:9-13` and `public-members.tsx:18-23,45-53` query without loader seed; `Promotions` renders `null` on both loading and error. `getLeadership` is loader-fetched on `/legal` but query-fetched on `/about`. | as listed | C1 (seed via loaders or `useSuspenseQuery`; add error branch) |
| J-08 | 3 | `public-members.tsx:44-78` hand-rolls pagination that `PaginatedList` already provides (once A1 lands). | as listed | C1 |
| J-09 | 2 | `donation-commitment-form.tsx:21-25` awaits `router.invalidate()` **inside** the mutation: a failed refresh after a successful commit shows a false error and invites a resubmit → double commitment (see X-05). | as listed | C1 (return result first, `void router.invalidate().catch(() => {})`) |
| J-10 | 2 | Public commitment endpoint has no abuse resistance (see X-04). | `data/donations.ts:8-10` | D3 |
| J-11 | 2 | R21 site face (see X-03): generic banner at `submission-form.tsx:53`; `input-field.tsx:19` never receives Zod issues; success swap at `submission-form.tsx:39` unmounts the focused button without moving focus. | as listed | C1 (adopt A2 + focus management) |
| J-12 | 3 | R20 site face (see X-02). Works today only because `jublawoma-data/src/forms.ts:9-16` is a non-strict object that strips unknown keys. | as listed | C1 (adopt A2) |
| J-13 | 3 | Quantity field label is just `item.unit` ("kg") — screen-reader hostile (`donation-commitment-form.tsx:54-62`); non-multiple-of-step quantities hit `validIncrement` → outcome `"unavailable"` → misleading "Diese Menge ist nicht mehr verfügbar." (`de-CH.json:308`, `donation.service.ts:20-21`). | as listed | C1 (label `Menge ({unit})`; distinct outcome/message; note: arithmetic fix is R02/D2) |
| J-14 | 1 | Site face of X-01 (`routes/events.tsx:17-23`, `routes/stories.index.tsx:17`). | as listed | B1 |
| J-15 | 2 | No per-route metadata anywhere except `__root.tsx:17-38`. | as listed | C1 |
| J-16 | 3 | `paginated-list.tsx:23` `initialData` seeds only an empty cache; revisits/`router.invalidate()` keep stale pages while loaders refetch page 0 (wasted work + stale UI). | as listed | A1 (add `staleTime`/reset semantics) + C1 |
| J-17 | 3 | Same-day donation ranges print the date twice ("25. Oktober 2026 – 25. Oktober 2026") while `model/dates.ts:13-18` collapses equal dates for events. Relates to open work "same-day event endings". | `model/donations.ts:25-36` | C1 |
| J-18 | 3 | Minor edges: gallery keyed by image id → duplicate React keys when an image is attached twice (`data/stories.ts:23-32`, `story-gallery.tsx:10`); placeholder string begins with a stray space (`de-CH.json:83`); decorative icons inconsistently `aria-hidden`; `rel="noopener"` vs `rel="noreferrer"` inconsistent (`header.tsx:59`, `footer.tsx:27`). | as listed | C1 |
| J-19 | 3 | Styling debt: `submission-control.tsx:39` uses Tailwind default `stone-*` palette off-brand; `__root.tsx:35` `theme-color: #a63848` is stale pre-rework wine-red branding; raw text grays `#686b5d/#68645f/#6d6964/#5f5b57` repeated in CSS and tsx. | as listed | B1 (see §5) |

### 3.3 Uncle-T (`web/sites/unclet`)

| ID | P | Finding | Evidence | Fix |
| --- | --- | --- | --- | --- |
| U-01 | 2 | Du/Sie mixed — open work item not resolved. Sie-form copy lives only in `services/event-planning.tsx:9,21` (+ its raw step strings); rest of site + catalog use Du. | as listed | C2 (rewrite to Du, move to catalog) |
| U-02 | 2 | Hardcoded German copy bypasses catalog: `routes/terms.tsx:7-33`, `services/catering-formats.tsx:18-23`, `services/event-planning.tsx:7-23`, `about/chef-experience.tsx:8,13,18,23,28`, `inquiry-form.tsx:39,47` placeholders, `showcase-facts.tsx:12-14` (though `m.guests()`/`m.location()` exist), `unclet-data/src/inquiry.email.ts:24,32-33`. | as listed | C2 |
| U-03 | 3 | Form trio duplication (site face of X-02). | `components/{submission-form,submission-control,input-field}.tsx` | C2 (adopt A2) |
| U-04 | 3 | R20 site face (see X-02). | `submission-control.tsx:8-20` | C2 |
| U-05 | 3 | `getResultError`/`defaults` declared but unused; inquiry `reference` (`data/inquiries.ts:28`) delivered only by email, never on page (`inquiry-form.tsx:25`). | as listed | C2 (render reference in receipt or drop props) |
| U-06 | 3 | Class-string duplication inside the site: CTA button string ×13 (`header.tsx:109`, `hero.tsx:31,38`, …), container string ×17 (`inquiry.tsx:36`, `footer.tsx:8`, `page-hero.tsx:26`, …). | as listed | B2 |
| U-07 | 2 | R29 residue: `showcase-card.tsx:36-40` renders raw markdown `body` in the teaser (`**bold**` shows literally); list payload still carries full body (`data/showcases.ts:24`), repo selects full rows (`unclet-data/src/public.repository.ts:15-16`). | as listed | D4 |
| U-08 | 3 | `public-reviews.tsx:8-16` re-implements pagination, diverging from `PaginatedList` (no loading state, static load-more label, empty state `null`). | as listed | C2 |
| U-09 | 2 | R21 site face (see X-03): name<2, guests>10000 or 0, text<5 (`unclet-data/src/forms.ts:16,22-24`) produce no field attribution. | as listed | C2 (adopt A2) |
| U-10 | 3 | Inquiry date accepts past/nonsense dates: `z.union([z.literal(""), z.iso.date()])` format-only (`unclet-data/src/forms.ts:14`), no `min` on input (`inquiry-form.tsx:51-55`). | as listed | C2 (`.refine` future + `min={today}`) |
| U-11 | 3 | Select (`submission-control.tsx:36-65`) and rating (`rating-control.tsx:17-47`) branches render no `Field.Error`. | as listed | C2 (or fold into A2 headless) |
| U-12 | 3 | Public review/inquiry endpoints unthrottled (see X-04); catalog copy `unclet_review_description` promises a "persönlicher Link … nicht in der öffentlichen Navigation" but `/review` is a plain public route (`review.tsx:8`). | as listed | D3 + C2 (fix copy or add unlinked token) |
| U-13 | 3 | Reviews publish name+text after moderation (`review-card.tsx:28-30`) with no consent line on the form and no privacy-page section on review publication. | as listed | C2 (one consent line near submit + privacy note) |
| U-14 | 3 | TZ/locale hydration risk: `showcase-facts.tsx:5-9` hardcodes `"de-CH"` and parses `T12:00:00` as local time. | as listed | C2 (use `getLocale()`, format date parts directly) |
| U-15 | 2 | Showcase detail pages ship no metadata (`showcases.$slug.tsx:8-17`) despite having cover images. | as listed | C2 |
| U-16 | 3 | Malformed slug → error page instead of 404 (see X-07). | `data/showcases.ts:53` | C2 |
| U-17 | 3 | Site face of X-01: no `.shell` defined; the container style it should carry is pasted inline 17× (U-06). One `.shell` class fixes both. | `styles.css` (absent), `ui/src/paginated-list.tsx:12,34,39` | B2 |
| U-18 | 3 | Reviews not in SSR HTML, no loading state (`public-reviews.tsx:8-18`); home route has no loader (`index.tsx:9`). | as listed | C2 (prefetch page 0 in loader + skeleton) |
| U-19 | 3 | Star ratings render only filled stars; 3-star reviews look ambiguous (`review-card.tsx:14-21`). | as listed | C2 (5 slots, outline for empty) |
| U-20 | 3 | Nav labels evaluated at module scope (see X-08). | `header.tsx:7-11` | C2 |

### 3.4 Zelglihof (`web/sites/zelglihof`)

| ID | P | Finding | Evidence | Fix |
| --- | --- | --- | --- | --- |
| Z-01 | 2 | R24 open: availability policy + German labels duplicated — `data/products.ts:11-26` recomputes reservation windows with `Date.now()` and hardcodes labels ("Direkt ab Hof" :19, "Reservation offen"/"Im Hofladen" :22-23; also `data/updates.ts:19` `category: "Vom Hof"`), while `zelglihof-data/src/reservation.repository.ts:19` re-evaluates with `now()`. Two clocks can disagree at window edges. | as listed | D1 |
| Z-02 | 2 | Sold-out products still show "Reservation offen": `reservationOpen = record.reservable && active` ignores variant stock (`data/products.ts:22-24`, `product-catalog.tsx:26-28`, `home/farm-shop.tsx:48-50`); only `reservation-form.tsx:10-13` discovers sold-out. | as listed | D1 |
| Z-03 | 3 | Class-string duplication: container `mx-auto w-[calc(100%_-_2rem)] max-w-[76rem] …` ×35, eyebrow ×26, CTA ×7 incl. raw `hover:bg-[#172f20]` (`product-reservation.tsx:7,9`, `update-article.tsx:11,29,36,52`, `header.tsx:37`, …). | as listed | B3 |
| Z-04 | 3 | Dead re-exports (`data/reservations.ts:9`, `data/contact.ts:9` — nothing imports); placeholder content in source: `about/farm-facts.tsx:3-25` hardcoded counts with "Platzhalter … bestätigen" comment; `about/seasonal-crops.tsx:5-17` hardcoded crop names though `crop-mosaic.tsx:11-71` shows the message-catalog pattern. | as listed | C3 (counts/crop names → messages pending owner data, see §8) |
| Z-05 | 3 | Module-scope `m.*()` (see X-08): `shop-empty-state.tsx:4-11`, `crops/crop-mosaic.tsx:11-71` (contrast correct pattern in `header.tsx:7-13`). | as listed | C3 |
| Z-06 | 3 | `home/latest-updates.tsx:36-49` re-implements `UpdatesEmptyState` markup. | as listed | C3 (render the component, parameterize size) |
| Z-07 | 2 | No per-page metadata on `products.index.tsx`, `products.$productId.tsx`, `latest.index.tsx`, `latest.$slug.tsx` (other routes have `head`). | as listed | C3 |
| Z-08 | 2 | R21 site face (see X-03): short message (`textSchema.min(10)`, `forms.ts:16`), quantity>100 etc. all yield the generic banner. | as listed | C3 (adopt A2) |
| Z-09 | 2 | R20 site face (see X-02): typo'd `name: "quantaty"` compiles, yields `NaN`/missing. | `submission-control.tsx:6`, `submission-form.tsx:22-27` | C3 (adopt A2) |
| Z-10 | 2 | Contact `subject` unreachable: `contact-form.tsx:25` pins `defaults={{ subject: "other" }}`; the `z.enum(["hofladen","reservation","hof","other"])` (`forms.ts:15`) can never be selected, yet the raw enum is emailed (`inquiry.email.ts:13`). | as listed | C3 (add subject select — open work "confirm contact fields" — or drop enum) |
| Z-11 | 2 | Duplicate reservations possible (see X-05); only guard is `use-submission-form.ts:24`. | `reservation.service.ts:17`, `reservation.repository.ts:32-45` | D2 |
| Z-12 | 3 | Quantity limits invisible/unenforced client-side: `min: 1`, no `max` (`reservation-form.tsx:34-40`), remaining stock never shown (`product-variants.tsx`), schema hard cap 100 (`forms.ts:25`). | as listed | C3 (`max` from stock + "Noch X verfügbar") |
| Z-13 | 3 | Reservation `reference` (`reservation.service.ts:39`) dropped — `submission-form.tsx:39` shows static success; email is optional (`reservation-form.tsx:52-56`) so an email-less customer leaves with nothing. | as listed | C3 (needs A2 `success: (result) => ReactNode`) |
| Z-14 | 3 | Token routes conflate terminal states: `newsletter.confirm.$token.tsx:22-24` maps Zod token failures and "expired" (`newsletter.confirm.ts:25`) to the same invalid-link bucket with a retry button that can never succeed (`:34-41`); no re-signup path. | as listed | C3 (distinct invalid/expired copy, no retry for terminal states) |
| Z-15 | 2 | Malformed product id / slug → generic error page instead of 404 (see X-07). | `products.$productId.tsx:10-11`, `latest.$slug.tsx:7-8` | C3 |
| Z-16 | 2 | Hardcoded `@zelglihof.ch` mailboxes may not exist (open work explicitly asks): `hof@zelglihof.ch` (`data/contact.ts:18`, `data/reservations.ts:18`), `newsletter@zelglihof.ch`/`hof@zelglihof.ch` (`data/newsletter.server.ts:7-8`) while the domain is `zelglihof-maegenwil.ch`. | as listed | §8 owner decision; do NOT silently change defaults |
| Z-17 | 3 | Site face of X-01: no `.shell` (`products.index.tsx:23-27` passes styled `emptyState` but error/CTA don't match the 76rem grid). | `ui/src/paginated-list.tsx:12,34,39` | B3 |
| Z-18 | 3 | R29 residual: home pulls full page 0 (default size 30, `validation.ts:45`) for 1 hero + ≤4 cards + 3 updates (`index.tsx:13-17`); `promotions.tsx:7-11` client-fetches and silently returns `null`. | as listed | C3 (small `size` + loader for promotions) |
| Z-19 | 3 | One-click unsubscribe endpoint unreachable: `api.newsletter.unsubscribe.$token.ts:7-18` implements RFC 8058 but `queue/message.ts:1-10` / `queue/email.ts:13-31` never emit `List-Unsubscribe`. Matches open work "Add … List-Unsubscribe headers". | as listed | D5 (decision-gated) |
| Z-20 | 3 | No abuse resistance (see X-04); only newsletter has a resend delay (`newsletter.subscribe.ts:21-25`). | as listed | D3 |
| Z-21 | 3 | `footer.tsx:65` `© {new Date().getFullYear()}` hydration mismatch at year boundary; `updates-list.tsx:30`/`update-article.tsx:20` render raw `publishedOn` ("Vom Hof · 2025-06-01") unformatted, no `<time dateTime>`. | as listed | C3 (year from root loader; format server-side in `data/updates.ts`) |

---

## 4. Task graph

Each task lists its **write set** (exclusive — no other task may write these files
while it runs), **read-only context**, dependencies, and acceptance criteria.
Parallelism rule: tasks may run concurrently **iff their write sets are disjoint and
neither edits `de-CH.json` at the same time as the other** (see serialization note).

### Phase A — shared packages (single agent, serial; blocks everything else)

| Task | Write set | Depends | Acceptance |
| --- | --- | --- | --- |
| **A1 — PaginatedList container contract** (X-01, J-14/J-16, U-17, Z-17) | `web/packages/ui/src/paginated-list.tsx` | — | `shell` no longer emitted implicitly. API: explicit props for the empty-state/error/load-more wrappers (e.g. `containerClassName?: string`, or render-prop `footer`), plus a sane `staleTime`/reset story (J-16). **No site file changes here** — call sites adapt in B lanes. Studio still type-checks. |
| **A2 — Typed submission fields + error mapping** (X-02, X-03, X-10) | `web/packages/ui/src/use-submission-form.ts`, `web/packages/ui/src/form-feedback.tsx`, new `web/packages/ui/src/submission-types.ts` (if needed) | — | `SubmissionField` names typed against `Input`; hook returns per-field errors keyed by schema path; generic banner reserved for server errors; `FormFeedback` success uses a `success` token class (document that sites must define `--color-success`); number coercion derivable from schema shape; add `success: (result) => ReactNode` support (needed by Z-13/U-05). **Backward compatible with studio's consumers** — additive or adapter; run `pnpm --filter studio build` to verify. |

### Phase B — per-site styling (3 agents in parallel; each owns one site)

| Task | Write set | Depends | Acceptance |
| --- | --- | --- | --- |
| **B1 — jublawoma styling + tokens** (J-01, J-14, J-19, X-09-comment) | `web/sites/jublawoma/src/**` | A1 | §5 jublawoma tokens in `@theme`; legacy `:root` vars removed (`--wine/--dark/--paper/--yellow/--blue/--line` → theme tokens; unify the two golds `#d1bf92`/`#e3d4af` into one `honey`); raw hexes in CSS **and** tsx replaced by tokens (4 grays → `bark-soft`; footer `#c8c8cb` → token); `stone-*` in `submission-control.tsx` → brand tokens; `theme-color` meta → current brand (bark `#343d30`); `.button-row` defined (CTA layout works) and marker classes `join-hero`/`about-hero`/`donation-item-list` removed or justified; `.shell`/container class defined and applied at `PaginatedList` call sites (`events.tsx`, `stories.index.tsx`) replacing X-01; stale `styles.css:52-81` comment rewritten to match reality (X-09); `@apply`/token usage inside remaining classes consistent. |
| **B2 — unclet styling + tokens** (U-06, U-17) | `web/sites/unclet/src/**` | A1 | §5 unclet tokens (`hairline`, `veil`, `gradient-card`, decide use-or-drop for `ash`/`paper`); `.shell` container class defined from the pasted string (17×) and those usages converted; CTA button class defined (`cta`) and 13× usages converted; `PaginatedList` call site (`showcases.index.tsx`) adapted to A1; `.two-column-form`, `.rating-control`, `.review-card`, `.image-treatment`, `.unclet-markdown` untouched except token value substitution. |
| **B3 — zelglihof styling + tokens** (Z-03, Z-17) | `web/sites/zelglihof/src/**` | A1 | §5 zelglihof tokens (`forest-dark`, `cream-veil`, `hairline`, `radius-card`, `shadow-card`); `.shell` (35× container), `.cta` (7×), `.eyebrow` (26×) defined and converted; raw `hover:bg-[#172f20]` → `hover:bg-forest-dark`; `PaginatedList` call sites adapted to A1; `tile-media`, `newsletter-*`, `contact-form-card`, `two-column-form`, `updates-empty`, `farm-markdown` untouched except token substitution. |

### Phase C — per-site behavior (3 agents in parallel, after A; **after B in the same lane** because both touch `submission-form.tsx`/`styles.css`)

| Task | Write set | Depends | Acceptance |
| --- | --- | --- | --- |
| **C1 — jublawoma behavior** (J-02…J-13, J-15…J-18) | `web/sites/jublawoma/src/**`, **plus serialized edit of `de-CH.json`** | A1, A2, B1 | Form trio deleted/adopted to A2 contract (X-02/X-03 site face closed); J-09 invalidate-after-result; J-13 labels + distinct increment message; J-03 copy into catalog (parameterized messages); J-04 link constants module; J-07 loader seeds + error branch; J-08 via `PaginatedList`; J-15 per-route `head` incl. story og tags; J-06/J-17 one date module + same-day collapse; J-18 keys/`aria-hidden`/`rel` consistency; J-02 dead code removed. |
| **C2 — unclet behavior** (U-01…U-05, U-08…U-16, U-18…U-20) | `web/sites/unclet/src/**`, `web/packages/unclet-data/src/forms.ts` (U-10 only), **serialized `de-CH.json`** | A1, A2, B2 | U-01 all Du; U-02 all copy in catalog; form trio adopted (A2); U-05 reference in receipt; U-08 via `PaginatedList`; U-10 future-date refine + `min`; U-11 error slots (or A2 headless covers); U-12 copy honesty (token link or reworded copy); U-13 consent line + privacy note; U-14 `getLocale()` + parts formatting; U-15 per-route `head` with og:image; U-16 404 on malformed slug (safeParse in loader); U-18 loader prefetch + skeleton; U-19 5-slot stars; U-20 render-time messages. |
| **C3 — zelglihof behavior** (Z-04…Z-06, Z-07, Z-08…Z-10, Z-12…Z-15, Z-18, Z-21) | `web/sites/zelglihof/src/**`, **serialized `de-CH.json`** | A1, A2, B3 | Form trio adopted (A2); Z-10 subject select (or enum dropped — see §8); Z-12 `max` + "Noch X verfügbar"; Z-13 reference in receipt (A2 success renderer); Z-14 terminal-state UX; Z-15 404 handling; Z-07 per-route `head`; Z-18 bounded home queries + loader for promotions; Z-21 year via loader + server-formatted `<time>`; Z-04 dead re-exports deleted (placeholder data → §8, move to messages only what's confirmed or keep flagged); Z-05 render-time messages; Z-06 reuse `UpdatesEmptyState`. |

**Serialization note (`de-CH.json` is a shared write set):** C1/C2/C3 must not edit
the message catalog concurrently. Either run C lanes' catalog edits one at a time, or
have each lane write a fragment file (e.g. `messages-<site>.patch.json` in the temp
dir) and a final pass merge them. The rest of each C lane is parallel-safe.

### Phase D — cross-boundary and decision-gated tasks

| Task | Write set | Depends | Gate | Acceptance |
| --- | --- | --- | --- | --- |
| **D1 — availability policy single-source** (Z-01, Z-02, closes R24) | `web/packages/zelglihof-data/src/**`, `web/sites/zelglihof/src/data/products.ts`, `web/sites/zelglihof/src/components/{product-catalog,product-reservation,home/farm-shop}.tsx`, `data/updates.ts` | C3 | none | Availability computed once (SQL/`now()` in `zelglihof-data`), returned as state + label *key*, translated in the component; `reservationOpen` false when all variants exhausted; display and write paths share one policy. |
| **D2 — idempotent public submissions** (X-05, Z-11, closes R10; open work item) | `database/migrations/V0xx__*.sql` (new, one file), `web/packages/zelglihof-data/src/reservation.{service,repository}.ts`, `web/packages/jublawoma-data/src/donation.repository.ts`, site form payloads | A2 | **decision-gated** (§8): key shape and replay contract need approval | Client-generated submission id, unique constraint, transaction returns original outcome on replay; donation capacity check stays transactional (R02 arithmetic policy choice belongs with this task). |
| **D3 — abuse resistance baseline** (X-04, J-10, U-12, Z-20) | `web/packages/*/src/forms.ts` (honeypot fields), `web/sites/*/src/components/submission-form.tsx` (hidden field) | A2, C-lanes, D1 | proxy rate limiting is infrastructure (out of scope) — document the split | Honeypot field in every public schema + form; server rejects silently; code comments point to the proxy rate-limit decision; per-email resend delay pattern from `newsletter.subscribe.ts` considered for the other forms. Doc ticks belong to D6. |
| **D4 — showcase list payload** (U-07, closes R29 residue) | `web/packages/unclet-data/src/public.repository.ts`, `web/sites/unclet/src/data/showcases.ts`, `web/sites/unclet/src/components/showcase-card.tsx` | C2 | none | List selects only summary fields; `body` replaced by a server-produced plain-text excerpt; teaser renders excerpt safely. |
| **D5 — List-Unsubscribe headers** (Z-19, open work item) | `web/packages/queue/src/**`, `web/packages/zelglihof-data/src/**` (email composition) | C3 | **decision-gated** (§8): sender policy per site is an owner item | `QueuedEmail` carries optional headers; welcome/confirm mail emits `List-Unsubscribe` + `List-Unsubscribe-Post`; the existing one-click route becomes reachable — or the route is removed. |
| **D6 — documentation sync** (X-09) | `documentation/code-quality-review.md`, `documentation/open-work.md` | ALL | none | R27 `page-title-accent` claim corrected/removed; R28 reworded to the actual contract; open-work items verified by this refactor are ticked with notes; this handoff's registry marked where superseded. |

---

## 5. Design tokens (target state)

All values are already present in the codebase; this is a consolidation, not a
redesign. Put these in each site's `styles.css` `@theme` block. Replace every raw
hex/legacy var in both CSS and TSX with the token. Font files already exist in
`unclet`/`zelglihof` `public/fonts` + `fonts.css`; jublawoma uses a system stack
(design decision to confirm — see §8).

**Jublawoma** — warm, playful; serif for blockquotes:
```css
--color-bark: #343d30;        /* text, dark surfaces (was :root color + --dark) */
--color-bark-soft: #686b5d;   /* muted body text — merge #686b5d/#68645f/#6d6964/#5f5b57/#686b5d */
--color-moss: #65734f;        /* primary accent (was --wine; name was wrong) */
--color-honey: #e3d4af;       /* gold accent — unify with legacy --yellow #d1bf92, keep ONE value */
--color-sage: #d0d8c3;        /* soft green surface (was --blue) */
--color-oat: #f5f0e6;         /* page background (was --paper) */
--color-sand: #e6ded2;        /* raised surface / image fallback / code bg (was raw) */
--color-line: #d9d1c5;        /* hairline borders (was --line) */
--color-clay: #a46f51;        /* warm accent — currently ~unused; keep only if design uses it (§8) */
--color-danger: #b91c1c;
--color-success: #65734f;     /* FormFeedback success (was emerald-500) */
--font-sans: Inter, "Segoe UI", sans-serif;
--font-serif: Georgia, serif;
--radius-pill: 999px;
--shadow-hover: 0 24px 70px rgb(52 61 48 / 12%);
```
Footer muted text `#c8c8cb` → `text-bark-soft`-equivalent on dark (`bark` bg) — add
`--color-oat-soft: #c8c8cb` only if the cooler gray is intentional; otherwise use a
warm tint of oat. Decide once in B1.

Landed (2026-10): gold unified on `honey #e3d4af`; footer muted text uses `oat-soft #d5cbb9`; `clay` deleted (unused).

**Uncle-T** — dark luxe (fonts already tokenized):
```css
--color-night: #11110f;  --color-coal: #1a1a17;  --color-ash: #2a2925;
--color-bone: #f2eee5;   --color-paper: #faf7f0;
--color-brass: #b99a5b;  --color-brass-light: #dbc38f;
--color-smoke: #aaa69d;  --color-danger: #f87171;
--color-success: #b99a5b;                       /* FormFeedback (was emerald-500) */
--color-hairline: rgb(242 238 229 / 12%);        /* repeated border */
--color-veil: rgb(242 238 229 / 2%);             /* card surface */
--gradient-card: linear-gradient(135deg, rgb(185 154 91 / 10%), transparent 46%); /* inquiry/review cards */
```
`ash` and `paper` are used ~once each: either apply consistently or drop (B2 decides,
record the decision in the `styles.css` comment).

Landed (2026-10): `ash` dropped, `paper` adopted.

**Zelglihof** — warm earthy (same font trio as unclet; `fonts.css` is identical in
both sites — may be shared later, not in this refactor):
```css
--color-ink: #1d291f;    --color-forest: #24452f;
--color-forest-dark: #172f20;   /* button hover — currently raw ×7 */
--color-moss: #637a52;   --color-sage: #b9c3a8;
--color-oat: #f2ecdf;    --color-cream: #fbf8f1;
--color-cream-veil: rgb(251 248 241 / 72%);      /* card surfaces */
--color-hairline: rgb(36 69 47 / 16%);           /* card borders */
--color-clay: #b85f42;   --color-sun: #e7b852;
--color-danger: #b91c1c;
--color-success: #24452f;                        /* FormFeedback (was emerald-500) */
--radius-card: 1.5rem;
--shadow-card: 0 24px 70px rgb(36 69 47 / 8%);
```

Cross-site convention going forward: named type roles instead of re-encoded strings
(eyebrow `0.72rem` uppercase tracking `0.14em`, body `1.05rem`, display clamp sizes) —
B lanes map existing usages to `@utility eyebrow`/`.shell`/`.cta`; a full type-scale
token set is explicitly **not** required in this refactor.

---

## 6. Tailwind integration rules (which custom CSS may move)

The three stylesheets already carry rationale comments; keep the discipline, fix the
stale parts. Decision table:

| Category | Action | Examples |
| --- | --- | --- |
| Markdown-rendered HTML blocks | **stay plain CSS** (renderer output cannot carry utilities) | `.markdown-content`, `.unclet-markdown`, `.farm-markdown` |
| Classes anchoring descendant/child selectors | **stay plain CSS** (converting the anchor orphans children; keep `:hover`/`.is-selected`/modifier variants with them) | `.donation-item`, `.page-hero`, `.tile-media`, `.rating-control`, `.two-column-form`, `.review-card`, `.contact-form-card`, `.image-treatment`, `.newsletter-form`, `.updates-empty`, `.brand`, `.site-nav`, `.legal`, `.footer-grid`, `.event-list`, `.story-*`, `.media-gallery`, `.promotion-*`, `.donation-*`, `.steps`, `.status-page`, `.honest-empty`, `.content-image-fallback` |
| Source-order-sensitive responsive overrides | **stay plain CSS** (520px rule must beat 850px rule for `.event-image`; `.review-card:first-child` spans) | jublawoma `.event-image`/`.promotion-card`, unclet `.review-card` |
| Repeated **flat** utility strings | **convert** to local `@utility`/plain class per site (site-local, not shared): `.shell` (container), `.cta` (button), `.eyebrow` | zelglihof ×35/×26/×7, unclet ×17/×13, jublawoma container ×~30 |
| Simple value classes used as variant anchors (`p:not(.kicker)`, `.page-hero .button`) | keep class name; prefer plain class with `@apply` **over** `@utility`, because `@utility` moves them into the utilities layer and changes precedence the jublawoma comment explicitly protects (`styles.css:69-71`) | `.kicker`, `.button`, `.nav-cta` |
| Legacy CSS variables / raw hex | **replace with `@theme` tokens** (§5) | jublawoma `:root` vars; `#172f20`; body grays |

Conversion pattern for repeated strings (zelglihof example):
```css
.cta {
  @apply inline-flex min-h-12 items-center justify-center gap-[0.55rem] rounded-full
    border border-transparent bg-forest px-[1.15rem] py-3 text-[0.9rem] font-[720]
    leading-none text-cream transition hover:-translate-y-0.5 hover:bg-forest-dark
    disabled:opacity-50;
}
```
Every conversion must update the `styles.css` rationale comment block.

---

## 7. Cross-boundary details worth exploring during the refactor

1. **Studio compatibility surface.** Before A2 lands, enumerate studio's imports of `@oliumbi/ui` and `@oliumbi/contracts` (read-only) and keep those signatures working. If the typed field model cannot be additive, prefer a new export over changing the old one.
2. **`PaginatedList` wrapper ergonomics.** Decide between a `containerClassName` prop vs. children-wrapping render prop by looking at the five call sites; the empty-state, error and load-more wrappers may need *different* containers per site (jublawoma `1240px` vs zelglihof `76rem` vs unclet `90rem`).
3. **`de-CH.json` layout.** Keys are site-prefixed (`jublawoma_*`, `unclet_*`, `zelglihof_*`, `studio_*`, shared unprefixed). New keys must follow the prefix convention; shared unprefixed keys (`required`, `error_generic`, `empty`, `loading`, `load_more`) are cross-site — changing their text affects all sites. R21's fix likely needs new **shared** keys (e.g. `validation_too_short`, `validation_too_long`, `validation_invalid`, `validation_range`) — define them once in Phase A's contract work so C lanes don't invent three synonyms.
4. **Zod issue → field mapping shape.** `issue.path` may be nested (arrays/objects) in future schemas; keying on `path[0]` is enough today (all public forms are flat), but note the limitation in the A2 API docs.
5. **Date/timezone policy.** jublawoma has two conventions (J-06); unclet has a hydration risk (U-14); zelglihof renders raw ISO dates (Z-21). Pick one policy per site and document it in `styles.css`-adjacent comment or the site README: "dates are formatted server-side / client-side with pinned locale X and timezone Y".
6. **`@source "../../../packages/ui/src"`** is present in all stylesheets — keep it when restructuring; shared `ui` classes (e.g. `form-control-wrap`, `is-wide`) must remain detectable by Tailwind's scanner.
7. **`form-control-wrap` / `is-wide`** live in site `submission-form.tsx` but are styled by site CSS (unclet `styles.css:100`, zelglihof `styles.css:162`). When the form trio is replaced by the A2 contract, keep these two class hooks (or their replacement) documented — the CSS depends on them.
8. **Generated files.** `routeTree.gen.ts` regenerates from `routes/`; never hand-edit. Build artifacts (`.output`, `node_modules`, `.dependencies-before-rework`) are gitignored; `.dependencies-before-rework` looks like a stale rework backup and can likely be deleted locally — do not include it in any commit.
9. **Verification toolchain quirk (R31):** `pnpm typecheck` depends on generated i18n output; run `pnpm --filter <site> build` or the i18n generation before type-checking a clean tree. Root `pnpm check` is Biome (style), child `check` scripts are `tsc`.
10. **Jublawoma `clay`/`honey` and unclet `ash`/`paper` near-zero usage** — during B1/B2 grep usage and either adopt or delete; record the choice in §5 tables (update this file in D6).

---

## 8. Decisions required before specific tasks (do not guess)

| Decision | Blocks | Note |
| --- | --- | --- |
| Idempotency key shape + replay contract for reservations/commitments; decimal quantity policy for donations (R02) | D2 | open work "Prevent duplicate reservations and donation commitments after retries" |
| `@zelglihof.ch` vs `zelglihof-maegenwil.ch` mailboxes actually existing | Z-16 (no code change until confirmed) | open work owner item; defaults are in `contact.ts`, `reservations.ts`, `newsletter.server.ts` |
| Contact `subject` field: which subjects are real | Z-10 | open work "confirm contact fields" |
| Uncle-T: phone-only replies (is email still required?) | U-fields | open work "confirm inquiry fields, phone-only replies" |
| Zelglihof placeholder farm facts / crop list (real numbers, real names) | Z-04 content part | open work "use real farm photos" implies content pass |
| Proxy rate limiting approach (caddy plugin vs deliberate gap) | D3 scope boundary | open work technical debt |
| Jubla: fonts (system stack vs self-hosted Inter) and whether `clay`/single-gold change the intended design | B1 | visual, small |
| Review consent wording + privacy-page text | U-13 | legal copy, owner-approved |

---

## 9. Verification

Run after every task (paths relative to repo root; from `web/` run pnpm):

```
pnpm check                       # Biome (web/)
pnpm typecheck                   # tsc per package + tests project (needs generated i18n)
pnpm build:jublawoma
pnpm build:unclet
pnpm build:zelglihof
pnpm --filter studio build       # REQUIRED after any web/packages/* change (studio is untouched but consumes them)
```

Additional per-change checks:
- Visual/styling tasks (B lanes): compare each affected route before/after (dev server
  or built preview); check the five `PaginatedList` pages explicitly (empty state,
  error state, load-more): jublawoma `/events` `/stories`, unclet `/showcases`,
  zelglihof `/products` `/latest`.
- Form tasks (A2/C lanes): exercise one invalid submit per form (client-side), one
  valid submit per form (dev backend), confirm per-field errors, receipt, and no
  double-submit.
- Do not mark open-work checkboxes until verified in staging; code-complete ≠ done.

---

## 10. Suggested dispatch order for the orchestrator

1. One agent: **A1 + A2** (serial, same write-set family `web/packages/ui`).
2. Three agents in parallel: **B1, B2, B3**.
3. Three agents in parallel: **C1, C2, C3** — with `de-CH.json` edits serialized
   (or via fragments + merge pass).
4. **D1** (zelglihof data) ∥ **D4** (unclet payload) — disjoint write sets. Then
   **D3** (honeypots): its schema edits touch the same `*-data` packages as D1/D2,
   so it runs after D1, not beside it.
5. **D2**, **D5** only after §8 decisions.
6. **D6** documentation sync last.

Total: ~13 tasks, 3 parallel waves plus gated tail. Every write set is exclusive; the
only shared mutable file across parallel tasks is `de-CH.json` (serialized) and
`documentation/*` (D6 only).
