# Studio

The shared administration application at `studio.oliumbi.ch`. It is one app for
all sites so sessions survive, and it is the only place where content,
submissions and accounts are managed. It is not a page builder, analytics suite,
CRM or marketing tool.

## Responsibility

Give an authenticated editor exactly the site-scoped actions they are allowed to
perform: content list/edit/preview/publish/archive, media upload and selection,
durable submission inboxes, delivery history, and account administration for
administrators.

## Inside

```text
web/sites/studio/src/
  components/        screens, domain views and the leaf UI layer
  components/ui/     every visual detail; views only arrange layout
  components/content/ per-site management views (jublawoma, unclet, zelglihof)
  hooks/             client behavior
  model/             navigation, labels and form contracts
  routes/            one authenticated workspace route + sign-in
  server/            authenticated server functions, service clients
  server/content/    per-site management server functions
```

- **Navigation** is one workspace route with search parameters, not a route per
  collection. `StudioSearchContext` carries navigation top-down. This keeps the
  session and editor state stable.
- **Collections** are modeled as explicit capabilities: read-only, editable and
  creatable. The collection machinery renders a capability union instead of
  accepting combinations it cannot display.
- **Record contracts** live in the owning site's `*-data` package; Studio imports
  them. Per-type `*-view.tsx` files stay; there is no universal CMS config
  language.
- **Visual styling** lives only in `components/ui/`. A view may use layout
  utilities, never color, border, radius, shadow or typography. State changes
  reserve their space so nothing moves.

## Authentication and authorization

1. The sign-in form posts to a Studio server function.
2. Studio calls identity's session endpoint with the internal bearer token and
   receives a session token plus actor.
3. Studio sets an HTTP-only, `SameSite=Lax` cookie. `__Host-` and `Secure` are
   used when `STUDIO_SECURE_COOKIES=true`.
4. Every server function resolves the actor through identity and checks the
   permission: `studio.admin` for administration, `<site>.manage` for a site.
5. Views and server functions both hide unauthorized actions, but only the
   server check is authoritative.

`requireActor(site?)` is the boundary. It runs through the
`studioAuthorization`/`authenticatedAuthorization` middleware that every server
function declares - a convention rather than a compiler-enforced capability
type; the typed guard was deliberately not built so TanStack's import
protection can see `createServerFn` ([TD-10](../../work/tech-debt.md#td-10)).

Password change and sign-out revoke the session server-side; the Studio handler
clears the cookie only after identity confirms success.

## Flow: editing content

1. The editor opens a collection; Studio requests a page from the owning data
   package through a server function.
2. The editor updates a record. Studio sends the record's `updatedAt` with the
   save.
3. The repository update compares `updatedAt` in the same transaction. A stale
   save returns a conflict outcome; Studio reports it and offers reload instead
   of silently overwriting another edit.
4. A successful save returns the new record and timestamp.
5. Publishing and archiving change explicit states; deletion is a separate,
   confirmed action (see [TD-08](../../work/tech-debt.md#td-08) for the policy gap).

Uploads are handled by the assets service. The editor tracks upload readiness
and blocks saving while an upload runs (TD-07, fixed 2026-11).

## Invariants

1. Authorization stays server-side. The browser never chooses its own site or
   record access.
2. Studio imports site data packages; no site imports Studio.
3. No component imports a route; navigation flows through model and context.
4. Visual styling lives in `components/ui/` only.
5. A save conflict is reported, never resolved by overwriting.
6. Account and permission changes acquire the identity lock; an administrator
   cannot remove their own `studio.admin` permission.

## Configuration and health

Required: identity and assets service URLs plus their internal authorization
tokens. Delivery history also needs messaging. `STUDIO_SECURE_COOKIES=true` over
HTTPS. Site public URLs and owner email addresses are per-site settings.

Health is `GET /`; the container health check uses it. Logs go to journald in
production. Local setup is in [development/local-setup.md](../../development/local-setup.md).

## Known gaps

- Authorization is a per-handler convention; a new handler can forget the
  middleware ([TD-10](../../work/tech-debt.md#td-10), R16).
- Mobile lists are design work in [open work](../../work/open-work.md). A
  related collection's panel navigation still bypasses the unsaved-edit warning
  (TD-09 residual).
