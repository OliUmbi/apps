# Refactoring handoff - studio (shared administration app)

Companion to `refactoring-web-packages.md` and `refactoring-web-sites.md`. Read
those two first for shared-package and public-site context; this document covers
`web/sites/studio` and the visual system built for it.

Written for an orchestrating agent. Dense on purpose. Where this document and a
sibling disagree, prefer the sibling for shared packages and this one for
studio.

---

## 1. Scope

| Area | Path | In scope |
| --- | --- | --- |
| Studio app | `web/sites/studio/src/**` | yes - primary |
| Studio styling | `web/sites/studio/src/styles.css` | yes |
| Grain/gradient utilities | `web/sites/studio/src/gradients.css` | yes - currently site-local, portable |
| Shared UI package | `web/packages/ui/src/**` | partial - `form-feedback.tsx` coupling only |
| Other sites | `web/sites/{jublawoma,unclet,zelglihof}` | no - see sibling docs |

Out of scope and untouched: routing, server functions, database, contracts,
identity, media, messaging.

---

## 2. Baseline - verified state at handoff

Run these before trusting any claim below.

```
cd web/sites/studio
pnpm check     # tsc --noEmit      -> exit 0
pnpm build     # vite build        -> exit 0
pnpm dev       # port 8000, or 8001 if taken
```

Both green at handoff. No console errors in the running app at
`http://localhost:8000/`.

Stack: TanStack Start + React 19, Tailwind CSS **4.3.3** via `@tailwindcss/vite`,
`@base-ui/react` primitives, paraglide i18n (locale `de`), drizzle/PostgreSQL.

### Structural state

- `src/components/ui/` = **26 leaf components + README**. This is the styling
  layer. Full inventory in `src/components/ui/README.md`.
- `src/styles.css` still contains the **legacy custom-class block** (~800 lines)
  and **deprecated token aliases**. Both are scheduled for deletion (task T-07).
- `src/gradients.css` = grain + aurora gradient utilities, self-contained.
- `src/components/input-field.tsx` and `src/components/date-field.tsx` are thin
  **deprecated shims** re-exporting from `ui/`. Delete at the end.

### Migration state - measured, not estimated

| Surface | State |
| --- | --- |
| `className="button*"` -> `Button` | **complete** (0 references left) |
| Design tokens | complete, with deprecated aliases still present |
| App shell + navigation | complete |
| Form primitives (text, checkbox, select, date, file, panel, dialog, badge) | complete |
| Detail/edit form layout (fields column + action rail) | complete |
| `not-found` / `page-error` / `campaign-send` | complete |
| Content detail views (`record-fields`) | 5 of 6 converted |
| Accounts / profile / messages / newsletter views | mostly converted |
| `site-overview.tsx` | **untouched** |
| Assets views | **untouched** |
| Legacy CSS block deletion | **not started** |

---

## 3. Work done in this session

### 3.1 Grain and gradient utilities (`src/gradients.css`)

Generic Tailwind v4 `@utility` set, deliberately site-agnostic:

```html
<div class="gradient-aurora noise">       <!-- preset + grain -->
<div class="gradient-tide noise-soft">    <!-- lighter grain -->
<div class="gradient-ember noise-5%">     <!-- explicit strength -->
<div class="bg-surface noise">            <!-- grain on any surface -->
```

Presets `gradient-aurora|dusk|tide|ember` are **pure data** in `@theme`; a single
functional utility `gradient-*` resolves them via `--value(--gradient-*)`. Adding
a preset is one `--gradient-<name>` line.

Grain is `noise` / `noise-soft` / `noise-strong` / `noise-<percent>`,
`--value(--noise-alpha-*, number, percentage, [number], [percentage])`.

Two pseudo-elements are used so the effects compose:
`gradient-*` paints on `::before`, `noise` on `::after`. Plain `background-image`
cannot stack from two utilities - the last one in the cascade wins - so
`gradient-aurora noise` would silently drop a layer.

### 3.2 Design tokens

Stone/warm-neutral dark scale, **no chromatic accent**. Colour carries meaning:
teal is interaction only (links, focus rings), red is failure. Everything else is
greyscale. Surfaces stack by fill and hairline, not shadow - flat by design.

| Group | Tokens |
| --- | --- |
| Surfaces | `canvas`, `layer-1`, `layer-2`, `layer-3`, `field` |
| Hairlines | `line-subtle`, `line`, `line-strong` |
| Foreground | `fg`, `fg-muted`, `fg-subtle`, `fg-disabled` |
| Interaction | `interactive` (teal) |
| Status | `danger`, `success`, `warning` |
| Shape | `radius-control` (2px), `radius-panel` (2px), `shadow-overlay` |
| Rhythm | `--spacing: 0.25rem` (4px) |

Utilities read as `bg-canvas`, `bg-layer-1`, `border-line`, `text-fg-muted`.
A token names what it is **for**, not what it looks like.

### 3.3 Component hierarchy rule

> **Visual styling lives only in `src/components/ui/`.** Views use layout and
> spacing utilities (`grid`, `flex`, `gap-*`, `p-*`, `m-*`, `w-*`, `max-w-*`,
> `col-span-*`) and never colour, border, radius, shadow or typography.

This produces a book structure:

| Level | Where | Answers |
| --- | --- | --- |
| Screen | `src/components/*-view.tsx` | what is on this page, in what order |
| Section | `src/components/<domain>/` | how a feature is arranged and wired |
| Leaf | `src/components/ui/` (flat) | exactly what it looks like |

**Measured conformance at handoff (do not assume this improves on its own):**

| Check | Result |
| --- | --- |
| Visual token names (`text-fg`, `bg-layer`, `border-line`, …) outside `ui/` | **0** - clean |
| Raw palette outside `ui/` | **5** remaining (see T-07) |
| Arbitrary spacing/type values outside `ui/` | **~27** remaining (see T-08) |
| `className="button*"` referencing the CSS class | **0** - clean |

The token-name check is clean because the sweeps replaced them with leaves. The
raw-palette and arbitrary-value checks are **not** clean - those are target rules
with known violations, listed as tasks, not a baseline that currently holds.

### 3.4 Rebuilt surfaces

- **App shell** (`app-shell.tsx`) - pure structure. Sidebar rail, top bar with
  workspace context, content column capped at `max-w-7xl`, mobile drawer.
- **Navigation** - `Nav`/`NavSection`/`NavItem`, `SiteSwitcher`, three
  navigation variants.
- **Form primitives** - `TextField`, `Checkbox`, `Select`, `Popover`+`Calendar`,
  `FileInput`, `Panel`, `Form`/`FormFields`/`FormActions`, `Alert`, `Badge`,
  `ConfirmDialog`, `DangerZone`, `RecordFields`/`RecordField`.
- **Detail/edit layout** - fields down one column, actions in a sticky side rail
  (`lg:w-64`, `lg:top-20`), stacking below `lg`.
- **Error screens** - `MessageScreen` leaf used by `not-found` and `page-error`.

---

## 4. Findings register

Each finding has evidence. These are the things that were actually wrong, not
style opinions.

### F1 - Unlayered CSS silently beat Tailwind utilities. **High impact.**

`styles.css` declared `button { color: inherit; }` and other element rules
**outside any layer**. Unlayered CSS outranks `@layer utilities` regardless of
specificity. Measured: the primary button computed `color` **and**
`background-color` both `#f2f0ed` (invisible text) while `text-canvas` sat unused
in its class list.

**Fix applied:** base element rules moved into `@layer base`.
**Still at risk:** the legacy custom-class block remains unlayered. Any rule
there still outranks utilities on the same element.

### F2 - Two palettes that disagree, plus undefined tokens. **High impact.**

`styles.css` `@theme` said `--color-background: #010102`, `--color-surface-1..4`;
`:root` said `#0d0d0f`, `--surface`, `--surface-raised`. They were documented as
"mirrored exactly". They were not.

Worse, these utilities were referenced across the app but **resolved to nothing**:
`bg-sidebar`, `border-border-soft`, `bg-surface`. Half the colour utilities in the
shell were no-ops - a large part of "the colours are off".

**Fix applied:** single token system; deprecated aliases keep old names resolving.

### F3 - Dead class hooks rendered unstyled UI. **High impact.**

`nav-item`, `brand-mark`, `site-switcher-button`, `login-page`, `login-body` were
used in markup but defined **nowhere** in the repo. Sidebar navigation items were
rendering as raw Base UI buttons.

**Fix applied** for shell; `brand-mark`/`login-body` were still referenced in
error screens and have now been removed too.

### F4 - The styles.css comment block is actively misleading.

The block at `styles.css:83` justifies keeping `.brand-mark`, `.nav-item` and
`.site-switcher-button` "as ordered CSS" because they "expand to very long
utility strings". Those rules do not exist. Do not treat that comment as
authoritative - regenerate or delete it (T-07).

### F5 - The grain texture had no contrast and the blend mode was wrong.

Measured with a canvas readback of the SVG:

- `feTurbulence` output: `rgbStd 0.06` on `rgbMean 0.73` - a near-flat pale wash,
  not noise.
- Its **alpha channel is also noise** (`alphaMean 0.5`, `alphaStd 0.12`), which
  halved the delivered amplitude again.
- Composited at `overlay .12` that yielded **0.13 LSB** of variation where
  banding needs ~2 LSB.

`overlay` also scales amplitude with luminance: at cb=0.05 it gives 0.46 LSB
(undithered) while at cb=0.40 it gives 14 LSB (speckled). Exactly backwards for a
dark UI.

**Fix applied:** `feComponentTransfer` expands contrast 3x around the documented
0.5 mean of `type='turbulence'`; `feFuncA slope=0 intercept=1` forces alpha to 1;
blend is `normal`, default alpha `0.03` -> ~2 LSB uniform dither with negligible
black lift.

Gotcha: `baseFrequency='1' numOctaves='1'` aliases to a **flat colour** at
1px-per-user-unit (`rgbStd 0`). Do not use it.

### F6 - `max-h-4xl` is not a Tailwind utility.

`4xl` lives in the `--container-*` namespace (width). `max-h-*` does not read it.
The class was silently dropped. Verify emitted CSS rather than assuming.

### F7 - Percentage heights need a definite parent height.

`h-full` on children of `min-h-full` computes to `auto`. `min-height` does not
make the height definite. Use `h-dvh`, or flex/grid distribution
(`flex-1`, `1fr`) instead of percentages.

### F8 - Base UI `Field.Control` generates its own `id`. **Silent a11y bug.**

An explicit `id` passed to `Field.Control` is overridden with a generated
`base-ui-...` id, so `<label for="...">` pointed at a non-existent element. The
label was not clickable and screen readers had nothing to associate.

**Fix applied:** `ui/field.tsx` exports `FieldInput`, a plain `<input>` with the
same `controlClass` that honours `id`. Use `FieldControl` when Base UI wiring is
wanted, `FieldInput` when the caller owns the element's `id`.

### F9 - Control height has two failure modes. Both were live.

- A fixed `h-10` on the shared control class **squashed `<textarea>`** to one
  line (4-row and 18-row fields both measured 40px).
- `min-h-10` then let the fieldset grid **stretch** single-line controls to
  59-89px, and a date trigger stretched to 62px to match the label column beside
  it.

**Fix applied:** `min-h-10 py-2` on `controlClass`, `content-start items-start`
on `FieldRoot`, `items-start` on the date/time row. Final state measured: every
single-line control 40px, textareas 98px/378px for 4/18 rows.

### F10 - `DetailItem` is load-bearing for ~20 detail views.

`content/display.tsx` `DetailItem` renders a bare `<div><dt>…</dt><dd>…</dd></div>`.
Its entire appearance comes from the **element rules** `.record-fields dt`,
`.record-fields dd`, `.record-fields > div` in `styles.css`. It is used by
`article-view`, `article-image-view`, `event-view`, `member-view`, `product-view`,
`product-variant-view`, `promotion-view`, `showcase-view`, `showcase-image-view`,
`story-view`, `story-image-view`, `inquiry-view`, `campaign-view`,
`product-reservation-view`, `subscriber-view`, `image-field`, `editor-controls`
and more.

**Consequence:** deleting the `.record-fields` element rules without first
replacing `DetailItem` with `RecordField` will silently unstyle a large part of
the content admin. Treat `display.tsx` as the gate for T-09.

### F11 - `FormFeedback` is still imported in 19 studio files.

`@oliumbi/ui/form-feedback` predates the reserved-space `Alert`. It does **not**
reserve height, so form submission still reflows the actions beneath it. Files:
`assets-view`, `dashboard-view`, `messages-view`, `profile-view`,
`subscriber-invite`, `account-details-form`, `account-list`,
`account-password-form`, `account-permissions`, `account-workspace`,
`create-account-form`, `asset-upload-form`, `collection-list`, `collection-view`,
`message-detail`, `subscriber-email-form`, `subscriber-status-actions`,
`profile-details-form`, `profile-password-form`.

`campaign-send`, `delete-confirmation`, `content-form`, `image-field`,
`login-view` have already moved to `Alert`.

### F12 - One behaviour change introduced during migration.

`Checkbox` (leaf) is controlled-only and has **no `disabled` prop**. The
hand-rolled checkboxes in `account-details-form` / `account-permissions` disabled
themselves while pending / before data loaded; that guard is now gone. Restore it
when `Checkbox` gains `disabled` (T-03).

### F13 - `styles.css` element rules are load-bearing for class-less markup.

`table`, `th`, `td`, `tbody tr:hover` style `collection-table.tsx` markup that
carries no classes. Removing them unstyles every data table. (`td { min-height }`
is a no-op on table cells - dead.) `image-upload-control input` and
`time-control input` also style bare elements; both parents are now converted,
so those rules are dead.

---

## 5. Leaf vocabulary and gaps

Read `src/components/ui/README.md` for the live inventory and rules. Present
today: `alert`, `badge`, `brand`, `button`, `calendar`, `checkbox`,
`danger-zone`, `dialog`, `drawer`, `field`, `file-input`, `form`,
`gradient-panel`, `menu`, `message-screen`, `nav`, `page-header`, `panel`,
`popover`, `record-fields`, `select`, `sidebar`, `split`, `text-field`, `text`,
`top-bar`.

### Gaps blocking remaining tasks (reported independently by two subagents)

| Missing leaf | Blocks | Notes |
| --- | --- | --- |
| `Checkbox` `disabled` + `description` slot | T-03 | also F12; permission rows keep a `<small>` workaround |
| `FilterChip` (selected + tone) | T-05 | `message-filter` + `.is-active` / `.failure` |
| `ListShell` + `ListRow` + `Avatar` | T-05 | `account-row`, `account-avatar`, `message-row`, `message-body`, `message-meta` |
| `AttemptRow` (timeline row, mono index, error `pre`) | T-05 | `attempt-list` |
| `FormFooter` (bordered divider row) | T-06 | `border-t border-border-soft pt-[18px]` repeated in 5 forms |
| `Panel` `kicker` slot + `className` passthrough | T-06 | password panel needs a wrapper div just for `col-span-full` |
| `Badge` `className` passthrough | T-05 | mobile rules `.account-row > .status-pill` can no longer place badges |
| `Row`-level `DetailItem` replacement | T-04 | see F10 |

---

## 6. Task plan

Phases are ordered by risk. Tasks inside a phase are parallelisable **except
where noted**; each names its files so agents cannot collide.

### Phase 0 - preconditions

- **T-00 Pin the baseline.** Run `pnpm check` and `pnpm build`; both must be 0.
  Record the commit. Everything below assumes this.

### Phase 1 - finish the leaf layer (no view edits)

Single agent, serial - these share `ui/` files.

- **T-01 `Checkbox` completion.** Add `disabled` and an optional `description`
  slot to `ui/checkbox.tsx`. Restore the pending/data-loading guard in
  `accounts/account-details-form.tsx` and `accounts/account-permissions.tsx`.
  Closes F12.
- **T-02 List and filter leaves.** `ui/list.tsx` (`ListShell`, `ListRow`,
  `Avatar`), `ui/filter-chip.tsx`, `ui/attempt-row.tsx`. Model them on the
  existing `.account-row` / `.message-filter` / `.attempt-list` rules so nothing
  regresses visually.
- **T-03 Panel and form chrome.** Add `kicker` and `className` passthrough to
  `ui/panel.tsx` and `ui/badge.tsx`; add `ui/form-footer.tsx`.

### Phase 2 - finish the views (parallel, disjoint files)

- **T-04 Content detail views -> `RecordField`.** Replace `DetailItem` with
  `RecordField` in every file listed in F10, then delete `DetailItem` from
  `content/display.tsx`. **Files:** all of `content/**/*-view.tsx`,
  `content/display.tsx`. Keep `ImageThumbnail` and `displayStatus`. This is the
  gate for T-09 - do not start T-09 before this lands.
- **T-05 List and message views.** `accounts/account-list.tsx`
  (`account-row`/`account-avatar`), `messages/message-list.tsx`,
  `messages/message-filters.tsx`, `messages/message-detail.tsx`
  (`attempt-list`), `accounts/account-permissions.tsx` (`permission-row`).
  **Files:** `accounts/**`, `messages/**`.
- **T-06 Assets and overview.** `assets-view.tsx` (`page-heading`),
  `asset-card.tsx`, `asset-upload-form.tsx`, `collection-table.tsx`
  (`border-white/10`), `subscriber-actions.tsx` (`settings-panel`),
  `subscriber-invite.tsx` (`text-zinc-400`), `site-overview.tsx`
  (`overview-heading`, `overview-monogram`, `overview-card`, `overview-index`,
  `page-kicker`, `text-[#a79ff4]` - the **last violet in the codebase**).
  **Files:** `assets/**`, `site-overview.tsx`, `subscriber-*.tsx`,
  `collection-table.tsx`, `assets-view.tsx`.
- **T-07 Remaining raw palette.** `subscriber-invite.tsx`, `asset-card.tsx`,
  `asset-upload-form.tsx` (`text-zinc-400` -> `text-fg-muted`),
  `collection-table.tsx` (`border-white/10` -> `border-line-subtle`),
  `site-overview.tsx` (`text-[#a79ff4]` -> `text-fg-subtle` or `text-interactive`
  depending on whether it is a link - see D-2).

- **T-08 Normalize arbitrary spacing and type values.** ~27 occurrences of
  `gap-[22px]`, `pt-[18px]`, `rounded-[7px]`, `rounded-[5px]`, `max-w-[640px]`,
  `text-[0.77rem]`, `leading-[1.5]`, `h-[46px] w-[68px]`,
  `grid-cols-[repeat(2,minmax(0,220px))]`, `grid-cols-[minmax(0,1fr)_auto]`.
  Snap to the 4px rhythm (`gap-6`, `pt-5`, `rounded-control`, `max-w-2xl`,
  `text-xs`, `leading-relaxed`, `size-*`) or promote the value to a leaf where it
  is a real fixed dimension (`ImageThumbnail` in `content/display.tsx:46`).
  **Files:** `account-editor.tsx`, `assets-view.tsx`, `messages-view.tsx`,
  `profile-view.tsx`, `site-overview.tsx`, `account-details-form.tsx`,
  `account-list.tsx`, `account-password-form.tsx`, `account-permissions.tsx`,
  `account-workspace.tsx`, `create-account-form.tsx`, `collection-view.tsx`,
  `content/display.tsx`, `message-detail.tsx`, `message-filters.tsx`,
  `subscriber-email-form.tsx`, `profile-details-form.tsx`,
  `profile-password-form.tsx`.
  **Overlap warning:** this file set intersects T-05 and T-06. Run T-08 *after*
  those two, or hand it the files they did not touch.

### Phase 3 - delete the legacy layer (after Phase 2)

- **T-09 Delete the legacy CSS block.** Remove every custom class from
  `styles.css` that has no remaining reference. Keep the `table`/`th`/`td`
  element rules until T-06 lands (F13), and keep `calendar-popup .rdp-root`
  until `ui/calendar.tsx` is confirmed to cover the DayPicker theming.
  Regenerate or delete the stale comment block (F4).
- **T-10 Delete deprecated token aliases.** Both the `@theme` alias block and the
  `:root` plain-property mirror. Then rename every remaining `bg-surface`/
  `text-primary`/`border-border` style call site to the new token names.
- **T-11 Delete shims.** `src/components/input-field.tsx`,
  `src/components/date-field.tsx` after all imports move to `ui/text-field` and
  `ui/…`.

### Phase 4 - cross-boundary (coordinate with the sibling reports)

- **T-12 `FormFeedback` retirement.** 19 studio files (F11). **Also affects
  jublawoma, unclet, zelglihof** - see `refactoring-web-sites.md`. Decide whether
  `Alert` moves into `@oliumbi/ui` (principles.md #3: two sites needing the same
  stable behaviour is the trigger) or each site keeps its own. Studio should not
  unilaterally change `form-feedback.tsx`.
- **T-13 Promote `gradients.css`.** It has no studio-specific code. If a second
  site wants it, move to `web/packages/` and add the `@import`. Otherwise leave
  it site-local - do not pre-emptively share.
- **T-14 `PaginatedList` latent trap.** `packages/ui/paginated-list.tsx` uses
  class `shell`, which only `web/sites/jublawoma/src/styles.css` defines. Studio
  does not use it today. Flagging so a future consumer is not surprised.

---

## 7. Cross-boundary details worth exploring

1. **The reserved-space rule is not yet universal.** `Alert` reserves 40px and
   `FieldMessage` reserves 16px so nothing shifts. `FormFeedback` (shared) does
   not. Any screen mixing both will still jump. This is a product-level rule the
   user asked for ("an alert shouldn't move existing elements and always use its
   space") and it should be applied consistently or not at all.
2. **`is-administration` tint was removed.** Admin mode no longer recolours the
   top bar. Neutral-only palette means mode should not change colour; the top bar
   already shows the workspace label. Confirm this is wanted before restoring.
3. **Two IA changes made without asking** - mobile menu button moved into the top
   bar (was `fixed left-3` + an `ml-12` offset hack), and the Administration
   entry moved to the end of the nav rather than pinned to the sidebar bottom
   (two `mt-auto` items split the free space and float the button mid-rail).
4. **`content-inset` (`--content-inset: 16px`) is still used by legacy rules** as
   a horizontal padding for full-bleed panels. The new leaves do not use it.
   Decide whether the concept survives; if not, delete it with T-08.
5. **`RecordFields` lost its container padding** (`px-4 pb-5` on `.record-fields`)
   and `related-panel` lost its border/padding chrome during conversion. Whether
   that is a regression depends on the surrounding container's padding - check
   the rendered detail pages before deleting the CSS.
6. **Heading semantics.** `PageHeader` always renders `h1`. `collection-view.tsx`
   deliberately uses `Title as="h3"` for inline embedded collections instead, to
   avoid a second `h1` on the page. Preserve that.
7. **The grain/gradient utilities need no JS and no assets.** The noise is an
   inline SVG data URI. It is a good candidate for the public sites' own noise
   layers (`zelglihof`/`unclet` currently hand-roll `feTurbulence` in
   `styles.css`) - see `refactoring-web-sites.md`.

---

## 8. Decisions required (do not guess)

| # | Question | Blocks | Leaning |
| --- | --- | --- | --- |
| D-1 | Does `Alert` move into `@oliumbi/ui`, or does each site keep its own and `FormFeedback` is retired per-site? | T-11 | Keep studio-local until a second site needs it (principles.md #3) |
| D-2 | Is the "open record" affordance in tables a link (teal) or a neutral action? | T-07 | Currently `Button variant="link"` = teal, on the grounds it navigates |
| D-3 | Should the detail form keep the sticky action rail on all screen sizes, or only `lg+`? | none - already built | Built as `lg+` sticky, stacks below `lg` |
| D-4 | Do the three height tiers (`h-10` controls, `h-9` rows, `h-8` compact) stand, or should rows be 40px too? | T-02 | Current tiers are documented in `ui/README.md` |
| D-5 | Is `--content-inset` a concept worth keeping across screens? | T-09 | Drop it - the leaf containers own their padding |

---

## 9. Invariants - do not regress these

1. **Visual styling only in `src/components/ui/`.** Views use layout/spacing
   utilities only. Enforce by scanning non-`ui/` `.tsx` for `bg-`, `text-`,
   `border-`, `rounded-`, `shadow-`, `#[0-9a-f]{6}`, `zinc-`, `white/`.
2. **No arbitrary spacing or type values** in markup (`p-[13px]`, `text-[0.78rem]`).
   The 4px `--spacing` rhythm is the scale. Arbitrary values are acceptable only
   for genuine layout sizes (`w-[90vw]`, `max-w-md`).
3. **Three heights.** `h-10` controls, `h-9` navigation/list rows, `h-8` compact
   buttons. Controls that must grow (textareas) use `min-h-10`.
4. **State changes never move anything.** Active markers reserve their space
   (`border-l-2 border-transparent`), field errors get a fixed 16px line, alerts
   get a fixed 40px slot. `FormFeedback` violates this - see F11.
5. **Colour means something.** Teal (`interactive`) is links and focus rings
   only. Red (`danger`) is failure. Everything else is stone. Checked states and
   primary buttons are **inverted neutral** (`bg-fg` / `text-canvas`), not accent
   coloured.
6. **`pnpm check` and `pnpm build` stay green.** Both are cheap; run them after
   every batch.
7. **No behaviour changes** in a styling refactor. Props, handlers, server calls
   and data flow stay byte-identical. F12 is the known exception and must be
   closed.

---

## 10. Verification

### 10.1 Static

```powershell
cd web/sites/studio
pnpm check
pnpm build
# visual styling leaking out of ui/
Select-String -Path (Get-ChildItem src -Recurse -Filter *.tsx).FullName `
  -Pattern 'zinc-|white/[0-9]|black/|#[0-9a-fA-F]{6}|text-fg|bg-layer|border-line|rounded-control'
# arbitrary spacing/type
Select-String -Path (Get-ChildItem src -Recurse -Filter *.tsx).FullName `
  -Pattern '\[[0-9]+px\]|text-\[0\.'
# legacy classes still referenced
Select-String -Path (Get-ChildItem src -Recurse -Filter *.tsx).FullName `
  -Pattern '["\s](page-kicker|page-heading|settings-panel|record-fields|status-pill|attempt-list|message-row|account-row)["\s]'
```

Note: `["\s]button["\s]` matches `type="button"` and gives a false positive.
Use `className="[^"]*\bbutton\b` to test for the CSS class specifically.

### 10.2 Rendered

Screenshots are unavailable unless the desktop window is visible
(`browser.screenshot` fails with "needs a visible tab"). Use computed styles
instead - this is how every claim in F1, F5, F7, F9 was established:

```js
// browser.evaluate on the running app
const cs = (el, ...p) => Object.fromEntries(p.map((x) => [x, getComputedStyle(el).getPropertyValue(x)]));
[...document.querySelectorAll("main input, main select, main textarea, main button")]
  .map((el) => ({ tag: el.tagName, type: el.getAttribute("type"), h: getComputedStyle(el).height }));
```

Expected: every single-line control `40px`; textareas grow with `rows`; hidden
inputs (`type=checkbox` internals, `type=file` under `sr-only`) are `1px` and
that is correct.

A create form is reachable without fixtures at
`/?site=zelglihof&area=site&section=zelglihof.product&mode=create`, which renders
text, textarea, checkbox, select, date and time controls on one screen - the
fastest way to confirm the control system is intact.

For grain/gradient work, measure the noise texture's pixel statistics in a canvas
(`rgbStd` should be ~0.3 after the contrast expansion, `alphaMean` exactly 1) and
compute the composited LSB variation at a dark backdrop before trusting a visual
impression. See F5.

---

## 11. Suggested dispatch order

1. T-00 (verify baseline) - one agent, cheap.
2. T-01 + T-03 (leaf completion) - one agent, serial, `ui/` only.
3. T-02 (list/filter leaves) - can run parallel to the above if it touches only
   new files.
4. T-04 + T-05 + T-06 + T-07 - **three agents in parallel**, disjoint file sets
   as listed. T-04 owns `content/**`; T-05 owns `accounts/**` + `messages/**`;
   T-06/T-07 own the assets/overview/subscriber cluster.
5. T-08 + T-09 + T-10 + T-11 - one agent, serial, **only after T-04 lands** (F10 gate). T-08 also after T-05 and T-06.
6. T-12 + T-13 + T-14 - coordinate with the orchestrator of
   `refactoring-web-packages.md` and `refactoring-web-sites.md`; these cross the
   package boundary.

Reserve the decisions in section 8 before dispatching the task they block.
