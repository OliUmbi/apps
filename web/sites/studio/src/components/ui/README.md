# `ui/` — the leaf layer

Every visual detail in Studio lives in this folder. Nothing else.

## The rule

**Visual styling belongs here and only here.** A view may use layout and
spacing utilities (`grid`, `flex`, `gap-*`, `p-*`, `w-*`, `max-w-*`,
`col-span-*`) to describe how a screen is arranged, but never colour, border,
radius, shadow or typography. If a view needs one of those, a leaf is missing
and should be added here.

This is what makes the app readable top-down like a book:

| Level   | Where                       | Answers                             |
| ------- | --------------------------- | ----------------------------------- |
| Screen  | `src/components/*-view.tsx` | What is on this page, in what order |
| Section | `src/components/<domain>/`  | How a feature is arranged and wired |
| Leaf    | `src/components/ui/`        | Exactly what it looks like          |

Start at a view to find _where_ something is, drop into `ui/` to change _how_
it looks. The leaves are flat on purpose: there is no nesting to learn.

## Vocabulary

| Element              | Purpose                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `text.tsx`           | The type scale: `Title`, `Kicker`, `Body`.                                                             |
| `field.tsx`          | Label, control and message slot. `controlClass` is the shared control shape.                           |
| `text-field.tsx`     | Single and multi-line text entry.                                                                      |
| `date-field.tsx`     | Date and optional time entry: popover trigger plus the `calendar.tsx` picker.                          |
| `checkbox.tsx`       | The only checkbox. `disabled` and `description` slots.                                                 |
| `select.tsx`         | Dropdown with selection.                                                                               |
| `popover.tsx`        | Anchored panel; `calendar.tsx` is the picker that sits in it.                                          |
| `file-input.tsx`     | File picker.                                                                                           |
| `button.tsx`         | `Button` and `IconButton`.                                                                             |
| `filter-chip.tsx`    | Filter toggle: `selected` plus `tone` (`danger` marks the failure filter).                             |
| `alert.tsx`          | Feedback that reserves its space, so nothing shifts. Studio-local by design — see below.               |
| `panel.tsx`          | A titled group of fields: `kicker`, title, description, `aside`. `className` carries layout placement. |
| `form.tsx`           | `Form`, `FormFields` and `FormActions`.                                                                |
| `form-footer.tsx`    | The divider row that closes a form and holds its buttons.                                              |
| `record-fields.tsx`  | Read-only detail: `RecordFields`, `RecordField`.                                                       |
| `dialog.tsx`         | `ConfirmDialog` for destructive actions.                                                               |
| `badge.tsx`          | Small status marker. `className` carries layout placement.                                             |
| `list.tsx`           | List chrome: `ListShell`, interactive `ListRow`, `StaticListRow`, `ListMeta`, `Avatar`.                |
| `attempt-row.tsx`    | Delivery timeline row: mono index, outcome line, error `pre`.                                          |
| `nav.tsx`            | `Nav`, `NavSection`, `NavItem`.                                                                        |
| `sidebar.tsx`        | `Sidebar`, `SidebarHeader`, `SidebarFooter`.                                                           |
| `drawer.tsx`         | Off-canvas navigation for small screens.                                                               |
| `top-bar.tsx`        | Workspace context bar.                                                                                 |
| `menu.tsx`           | The only dropdown menu.                                                                                |
| `brand.tsx`          | The identity mark.                                                                                     |
| `page-header.tsx`    | The top of every screen: kicker, screen name, supporting copy.                                         |
| `split.tsx`          | Page-level split: scenery panel + content panel.                                                       |
| `gradient-panel.tsx` | Sign-in aurora, grain and a faint registration grid.                                                   |
| `message-screen.tsx` | Centred card for empty and failed screens.                                                             |
| `danger-zone.tsx`    | The destructive end of a record, behind a red hairline.                                                |

Add a leaf when the same look appears twice. Do not add a leaf to abstract a
single one-off — a view can carry a layout utility instead.

## Conventions

- Tokens only (`bg-layer-1`, `text-fg-muted`, `border-line`). No raw hex, no
  `zinc-*`, no `white/*`. If a colour is missing, add a token to `styles.css`.
- Spacing on the 4px rhythm. No arbitrary values like `p-[13px]`.
- Controls use 40px and compact actions 32px minimum heights; navigation rows
  are 40px. Alerts and validation copy may grow instead of clipping.
- Colour means something: blue is interaction, red is failure. Colourful
  gradients belong only to the sign-in surface, never to record state.
- State changes never move anything. Active markers, error lines and alerts
  reserve their space up front (`border-l-2 border-transparent`, the error slot
  in `text-field`, the slot in `alert`).

## Shared `@oliumbi/ui`

`@oliumbi/ui` is the leaf layer for the public sites. Studio keeps its own
styled leaves and does not import the shared styled components.

**Why `alert.tsx` stays studio-local.** The shared `@oliumbi/ui/alert` carries
the same `role="alert"`/`status` and error/success tone contract, but pins a
`rounded-lg` public-site geometry that does not match Studio's 2px controls.
Studio reserves a 40px minimum slot and lets wrapped messages grow, so feedback
never clips. Re-exporting the shared component would move Studio's visual detail
out of this folder — the one rule this layer exists to enforce.
