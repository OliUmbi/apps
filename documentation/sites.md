# Sites and capabilities

What each property is, what it does, and the vocabulary shared across domains.
Owner input summarized here; scope changes belong in [open-work.md](open-work.md).

## Portfolio

| Site | Purpose | Priority |
| --- | --- | --- |
| Studio | shared content and workflow management for all sites | Primary |
| `zelglihof-maegenwil.ch` | farm, products, services | Primary (first vertical slice) |
| `jublawoma.ch` | association information and member engagement | Primary |
| `uncle-t.ch` | catering marketing and inquiries | Primary (first legacy migration) |
| `oliumbi.ch` | personal presence and experiments | Secondary |

## Shared capability map

| Capability | Zelglihof | Jublawoma | Uncle-T | Oliumbi |
| --- | --- | --- | --- | --- |
| Static/structured pages | yes | yes | yes | yes |
| News/articles | announcements | existing | optional | desired |
| Media and documents | yes | yes | yes | yes |
| Contact submission | yes | yes | yes | yes |
| Product/order interest | yes (preorder intent) | no | no | no |
| Booking request | no | no | yes | no |
| Public reviews | no | no | yes | no |
| Donations | no | yes | no | no |
| Event information | via news | yes | via services | career/blog |
| Subscribers/notifications | yes | possible | no | existing data |
| Roles | site admin | site admin | site admin | site admin |

A discovery tool, not a universal data model: a farm order intent is not the
same domain as a catering booking.

## Zelglihof

Sells meat from the farm (preorder intent, **no payment**), promotes seasonal
produce ("aktuell" posts like sweetcorn or beans), and presents the farm.

- Shop: customers see what is available now, pick a package/quantity and leave
  name, mail, phone. Availability states: available, seasonal, preorder,
  unavailable.
- Announcements ("posts", roughly 1–2 per month) with opt-in newsletter
  notifications and unsubscribe.
- Hofladen (farm shop) section for eggs and daily goods.
- About: family farm (Mutterkuhhaltung + Ackerbau, ÖLN/SGA/SwissGAP), people,
  animals with counts, crops with galleries.
- Services (Saat, Pflanzenschutz, Winterdienst) deferred until the owner
  decides what to offer.
- Cross-reference Uncle-T (same family businesses) — generic enough for other
  pairings later.
- Design: modern farm, warm earthy colors, softer edges, not techy. Real farm
  photos (the demo images are gone).

## Uncle-T

Chef and catering business. Marketing plus qualified inquiries.

- Unify catering and private dinners into one "range of events" offer (small to
  large). Courses removed — not core.
- About: professional experience (Gusto Sieger 2013, 3y Koch Gstaad Palace, 3y
  Privatkoch, 4y Chef Catering, selbständig seit 2024).
- Showcase past events: people count, menu, images, where/for whom, region list
  (Aargau, Mägenwil, Lupfig, Mellingen, Baden, Brugg, Wohlen, Aarau, …) for
  search.
- Booking requests with a clear workflow state (open → in progress → done /
  rejected), reviews with moderation (open → public / rejected) and consent.
- Instagram integration is an explicit owner requirement; Google reviews
  alongside own reviews is an open item.
- Design: clean and professional, luxury dinners to company burger parties,
  gold accents, sharper edges, dark mode worth trying.

## Jublawoma

Association site for members, parents and group leaders.

- Event calendar with PDF export for printing; more promotion of upcoming
  events on the home page.
- Donation campaigns (about two per year, currently hand-managed in the DB):
  campaign products, donor commitments, hidden when inactive, promoted when
  active.
- News/stories concept: camp stories (~8 per week of camp, notes from kids, lots
  of pictures, maybe video) mixed with town-event promotions.
- Members section (~50 members beyond the leaders) with picture, name, group
  and role. Consent for all members is obtained and handled by the club.
- Better join page. Documents (Anmeldung, Datenschutz, Jahreskalender) stay
  downloadable.
- Future ideas: background video on home, a Swiss map of yearly camps, a small
  merch shop.

## Oliumbi

Personal portfolio/CV for now: home/profile, projects, writing, contact,
required legal pages. Experiments (personal tools) live behind a login and are
explicitly out of scope for now. Legacy articles and subscribers migrate only
with verified consent.

## Studio (shared administration)

One application for all sites, reached at `studio.oliumbi.ch` (every other
`studio.*`/`admin.*` name redirects there so sessions survive). Scope:

- sign-in, expiry, recovery, session revocation;
- site switcher limited to authorized sites;
- content list/edit/preview/publish/archive with revision context;
- media upload, alt text, usage view, safe deletion;
- inbox and status changes for durable workflows (bookings, donations,
  reviews, contact), with actor attribution;
- clear empty/loading/error/conflict states; audit view for destructive actions.

Roles describe actions (publish, media, private submissions), not one broad
admin flag. It is not a page builder, analytics suite, CRM or marketing tool.

## Domain vocabulary

Planning names, not a schema: **Site** (public property and authorization
scope), **Editor**, **Role**, **Content item**, **Article/announcement**,
**Media asset** (original + metadata + derived variants), **Submission**
(durable visitor request with status and retention), **Booking request**,
**Product offer**, **Review**, **Donation campaign**, **Message job** (a
notification instruction, independent of domain data), **Audit event**. Every
concept needs an owner, lifecycle, private fields, retention and deletion
behavior before implementation.

## Per-site launch checklist

Owner-approved content, branding, legal text · all routes, redirects,
canonicals, sitemap and not-found tested · real content instead of demo data ·
keyboard/screen-reader/contrast/responsive checks · forms validate on both
sides, persist durably, resist abuse, show a receipt · private-data permissions
and retention tested · metadata and social previews set · health, alerts,
backup, restore, deploy and rollback exercised · DNS/TLS cutover documented with
a backout · embeds disclosed and consented · legacy inventory reconciled.
