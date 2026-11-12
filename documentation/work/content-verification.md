# Content verification before go-live

The public copy is the most visible part of the migration and the easiest place
to publish an invented number, date or credential. This page is the claim
inventory for Uncle-T and Jublawoma: every specific factual statement in the
new copy, the evidence behind it, and the owner decision that resolved it.

**Rule:** a specific claim (number, year, duration, name, title, address,
service area, capacity) is published only with a source in this table or an
explicit owner confirmation. When a claim cannot be verified, remove the
specific and keep the qualitative sentence. Marketing language is free; invented
facts are not.

Sources used here:

- the live legacy sites (`uncle-t.ch`, `jublawoma.ch`), which are still the
  content baseline;
- the legacy pages in `C:\Users\olive\IdeaProjects\websites` for copy that is no
  longer reachable;
- the commercial register for Uncle-T GmbH;
- the Jungwacht Blauring Aargau annual report 2025 and jubla.ch for national and
  cantonal membership figures;
- a public Instagram post describing Thomas Habegger's career, used as a lead
  and confirmed by the owner in 2026-11.

The legal pages are reviewed separately; this page covers editorial claims.

## Uncle-T

| Claim | Where it appears | Evidence | Status |
| --- | --- | --- | --- |
| Uncle-T GmbH, Thomas Habegger, Zelgliweg 2, 5506 Mägenwil; info@uncle-t.ch | footer, inquiry aside, legal, privacy | legacy contact/imprint; commercial register | confirmed |
| Company founded / entered in 2024 | about timeline, "Seit 2024" | commercial register entry 07.02.2024 | confirmed |
| Gusto-Sieger 2013 | home chef block, about timeline | legacy about page ("Im Jahr 2013 wurde ich Gusto-Sieger") and the public Instagram post | confirmed |
| Three years at Gstaad Palace | home chef block, about timeline | public Instagram post ("Anschliessend arbeitete Thomas drei Jahre im Gstaad Palace") | confirmed by owner 2026-11 |
| Four years as chef in a butcher's catering | about timeline | public Instagram post ("vier Jahre als Chef im Catering einer Metzgerei") | confirmed by owner 2026-11; copy now says "Catering" in Zürich, not "Chef Catering" in Aargau |
| Experience as a private chef | home chef block, about | legacy about page ("mehrjährige Erfahrung als Privatkoch auf der ganzen Welt") | confirmed; duration changed to "mehrjährige" (2026-11) |
| Service area | inquiry aside | owner's SEO direction 2026-11: based in Mägenwil, works well beyond it | updated to "Aargau (Mägenwil, Lupfig, Mellingen, Baden, Brugg, Wohlen, Aarau), Zürich, Luzern und Basel – weitere Orte in der Deutschschweiz nach Absprache"; the exact list stays editable |
| Guest capacity | home | owner 2026-11: 150+ company events are common, no practical limit | updated to "2 bis 150 Gäste und mehr" |
| Private dinner, birthdays, weddings, corporate/Apéros, buffets, grilling | services | legacy home/catering; legacy Grillkurs; owner 2026-11: "he does everything and grilling is common" | confirmed; the fire format is now "Grillieren & Kochen am Feuer" |
| Fresh, seasonal, regional ingredients; local suppliers | about, services | legacy catering/about ("Qualität und Frische der Zutaten", "enge Zusammenarbeit mit meinen lokalen Lieferanten") | confirmed as qualitative copy |
| Timeline order: Gusto 2013 → Gstaad → private chef → Zürich catering → Uncle-T 2024 | about | public Instagram post (Gstaad, Zürich, four years catering) plus the legacy private-chef copy; owner 2026-11: follow the public post | updated 2026-11; the private-chef chapter stays as the international station between Gstaad and the Zürich catering role |

## Jublawoma

| Claim | Where it appears | Evidence | Status |
| --- | --- | --- | --- |
| Full name "Jungwacht Blauring Wohlenschwil Mägenwil"; short name "Jubla WOMA" | header, footer, legal, metadata | owner 2026-11; the 2025 annual report writes "Jubla Wohlenschwil-Mägenwil" as an internal short form | confirmed; brand, SEO and Studio labels use "Jubla WOMA" |
| Vogelsangstrasse 2, 5512 Wohlenschwil; scharleitung@jublawoma.ch | footer, join, legal | legacy contact/imprint | confirmed |
| About 100 children and 40 leaders from Wohlenschwil, Mägenwil and Tägerig | home hero, about | legacy home; the 2025 Aargau annual report lists 168 members for the Schar | kept approximate with "rund"; no exact figure is published |
| Over 32'000 members nationally | about, join, partner card | legacy copy was stale (31'000); current public figures are about 32'500–33'000 | updated 2026-11 |
| 53 Aargau sections with around 4'700 members | about partner card | 2025 annual report lists 4'679 members; kathaargau (2024) names 53 sections | updated 2026-11 |
| Leaders aged about 17–25 | about | legacy about page | confirmed |
| Groups of 6–12 children with 1–3 leaders | about partner card | legacy about page | confirmed |
| Children from the 3rd grade | home join section, join page | legacy home and join page | confirmed |
| Partner descriptions (Jubla Schweiz, Jubla Aargau, J+S) | about | legacy about page | confirmed as association copy; membership numbers updated as above |
| Leadership names in the imprint | legal | live `jublawoma.member` records with `leadership = true`; owner 2026-11 | fixed: the page renders the current leadership only and no longer uses a static fallback; Saskia Schmid has left the club |
| "Jahreskalender 2026" | events | the PDF in `web/sites/jublawoma/public/assets/documents` was created 2026-01-18 | confirmed |
| Tägerig is part of the catchment area | home, site description | legacy home | confirmed |

## Social proof and third-party content

- The old Instagram iframe is **not** replaced with a feed. Uncle-T's showcases
  and Jublawoma's stories carry the visual content, and both sites link to their
  Instagram profiles. No Meta script, token or API is involved.
- Uncle-T links to its Google Business Profile for reviews. The link is a plain
  outbound link; no Google script runs, no Places API is called and no review
  content is stored. This is the first step; the owner can add a server-side
  Places API block later if review text is required (D36).

## Deliberately not claims

These are editorial voice and do not need a source: "Dein Anlass. Meine
Küche.", "Essen schafft Erinnerungen", "Draussen zuhause", the values copy, the
stories and donation introductions. Do not add new specifics (years, member
counts, awards, capacities) to them without a row here.

## Procedure

1. The owner reviews this table and answers every remaining "confirm" row.
2. Edit `web/packages/i18n/messages/de-CH.json` (and components only where the
   number is rendered separately) using the answers.
3. Re-check the rendered pages against this table; a removed number must not
   leave a dangling phrase ("seit", "über", "rund").
4. Add any new specific claim to this table before publishing it.
5. Record the sign-off in the [go-live checklist](../operations/checklists/go-live.md).

## Sign-off

| Area | Reviewed by | Date | Result |
| --- | --- | --- | --- |
| Uncle-T claims | | | |
| Jublawoma claims | | | |
| Numbers and dates re-checked in the browser | | | |
