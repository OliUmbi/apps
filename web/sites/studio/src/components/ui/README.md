# `ui/` — the leaf layer

Every visual detail in Studio lives in this folder. Nothing else.

## The rule

**Visual styling belongs here and only here.** A view may use layout and
spacing utilities (`grid`, `flex`, `gap-*`, `p-*`, `w-*`, `max-w-*`,
`col-span-*`) to describe how a screen is arranged, but never colour, border,
radius, shadow or typography. If a view needs one of those, a leaf is missing
and should be added here.

This is what makes the app readable top-down like a book:

| Level | Where | Answers |
| --- | --- | --- |
| Screen | `src/components/*-view.tsx` | What is on this page, in what order |
| Section | `src/components/<domain>/` | How a feature is arranged and wired |
| Leaf | `src/components/ui/` | Exactly what it looks like |

Start at a view to find *where* something is, drop into `ui/` to change *how*
it looks. The leaves are flat on purpose: there is no nesting to learn.

## Vocabulary

| Element | Purpose |
| --- | --- |
| `text.tsx` | The type scale: `Title`, `Kicker`, `Body`. |
| `field.tsx` | Label, control and message slot. `controlClass` is the shared control shape. |
| `text-field.tsx` | Single and multi-line text entry. |
| `checkbox.tsx` | The only checkbox. |
| `select.tsx` | Dropdown with selection. |
| `popover.tsx` | Anchored panel; `calendar.tsx` is the picker that sits in it. |
| `file-input.tsx` | File picker. |
| `button.tsx` | `Button` and `IconButton`. |
| `alert.tsx` | Feedback that reserves its space, so nothing shifts. |
| `panel.tsx` | A titled group of fields. |
| `form.tsx` | `Form` and `FormActions`. |
| `record-fields.tsx` | Read-only detail: `RecordFields`, `RecordField`. |
| `dialog.tsx` | `ConfirmDialog` for destructive actions. |
| `badge.tsx` | Small status marker. |
| `nav.tsx` | `Nav`, `NavSection`, `NavItem`. |
| `sidebar.tsx` | `Sidebar`, `SidebarHeader`, `SidebarFooter`. |
| `drawer.tsx` | Off-canvas navigation for small screens. |
| `top-bar.tsx` | Workspace context bar. |
| `menu.tsx` | The only dropdown menu. |
| `brand.tsx` | The identity mark. |
| `split.tsx` | Page-level split: scenery panel + content panel. |
| `gradient-panel.tsx` | Decorative aurora surface under a grain overlay. |

Add a leaf when the same look appears twice. Do not add a leaf to abstract a
single one-off — a view can carry a layout utility instead.

## Conventions

- Tokens only (`bg-layer-1`, `text-fg-muted`, `border-line`). No raw hex, no
  `zinc-*`, no `white/*`. If a colour is missing, add a token to `styles.css`.
- Spacing on the 4px rhythm. No arbitrary values like `p-[13px]`.
- Three heights, so rows never reflow when state changes: `h-10` controls,
  `h-9` navigation and list rows, `h-8` compact buttons.
- Colour means something: teal is interaction only, red is failure. Everything
  else is stone.
- State changes never move anything. Active markers, error lines and alerts
  reserve their space up front (`border-l-2 border-transparent`, the error slot
  in `text-field`, the slot in `alert`).
