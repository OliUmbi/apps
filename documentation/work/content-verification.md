# Content verification before go-live

The public copy is the most visible part of the migration and the easiest place
to publish an invented number, date or credential. This page is the claim
inventory for Uncle-T and Jublawoma: every specific factual statement in the
new copy, the evidence behind it, and what still needs an owner answer.

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
- a public Instagram post describing Thomas Habegger's career (treat it as a
  lead, not as owner confirmation).

The legal pages are reviewed separately; this page covers editorial claims.

## Uncle-T

| Claim | Where it appears | Evidence | Status |
| --- | --- | --- | --- |
| Uncle-T GmbH, Thomas Habegger, Zelgliweg 2, 5506 Mägenwil; info@uncle-t.ch | footer, inquiry aside, legal, privacy | legacy contact/imprint; commercial register | confirmed |
| Company founded / entered in 2024 | about timeline, "Seit 2024" | commercial register entry 07.02.2024 | confirmed |
| Gusto-Sieger 2013 | home chef block, about timeline | legacy about page ("Im Jahr 2013 wurde ich Gusto-Sieger") and the owner's public Instagram post | confirmed |
| Three years at Gstaad Palace | home chef block, about timeline | owner/event Instagram post ("Anschliessend arbeitete Thomas drei Jahre im Gstaad Palace") | confirm with owner; public source exists |
| Four years in catering, "Chef Catering" | about timeline | owner/event Instagram post ("vier Jahre als Chef im Catering einer Metzgerei") | confirm wording with owner; "Chef Catering" is an interpretation, not a legacy term |
| Three years cooking for private guests | about timeline | legacy only says "mehrjährige Erfahrung als Privatkoch auf der ganzen Welt"; no duration | **fix or confirm** – the "drei Jahre" is not sourced |
| International experience as a private chef | home chef block, about | legacy about page | confirmed |
| Service area: Mägenwil, Lupfig, Mellingen, Baden, Brugg, Wohlen, Aarau | inquiry aside | no source in legacy or public material | **fix or confirm** – keep "Aargau und Umgebung" unless the owner confirms the list |
| "2 bis beliebig viele Gäste" | home | no source in legacy | **fix or confirm** – "2 bis viele Gäste" was the earlier, safer wording |
| Private dinner, birthdays, weddings, corporate/Apéros | services | legacy home and catering page | confirmed |
| Buffets & Flying Dinner, cooking on fire | services | buffet appears in legacy photos, fire cooking only as a Grillkurs in the legacy courses page | confirm the current offer with the owner |
| Fresh, seasonal, regional ingredients; local suppliers | about, services | legacy catering/about ("Qualität und Frische der Zutaten", "enge Zusammenarbeit mit meinen lokalen Lieferanten") | confirmed as qualitative copy |
| "Chef Catering" | about | derived from "Chef im Catering einer Metzgerei" | rename or confirm; it is not a legacy label |
| Timeline order: Gusto 2013 → Gstaad → private chef → catering → Uncle-T 2024 | about | legacy confirms Gusto and international private chef; the public post puts Gstaad before Zürich and four years in a butcher's catering, without dating the private-chef chapter | confirm the order and the gaps with the owner before publishing the timeline |

## Jublawoma

| Claim | Where it appears | Evidence | Status |
| --- | --- | --- | --- |
| Jungwacht Blauring Wohlenschwil Mägenwil; Vogelsangstrasse 2, 5512 Wohlenschwil; scharleitung@jublawoma.ch | footer, join, legal | legacy contact/imprint | confirmed address and mail; confirm the official name with hyphen ("Jubla Wohlenschwil-Mägenwil" in the 2025 annual report) |
| About 100 children and 40 leaders from Wohlenschwil, Mägenwil and Tägerig | home hero, about | legacy home; the 2025 Aargau annual report lists 168 members for the Schar | confirm current figures; the legacy number may be stale |
| 31'000 members nationally | about, join, partner card | legacy copy; current public figures are about 32'500–33'000 (jubla.ch/Wikipedia 2024) | **update or remove the number**; it is stale |
| 53 Aargau sections with almost 5'000 members | about partner card | legacy copy; 2025 annual report lists 4'679 members, kathaargau (2024) names 53 sections | update to "rund 4'700" or confirm both figures with a date |
| Leaders aged about 17–25 | about | legacy about page | confirm with owner |
| Groups of 6–12 children with 1–3 leaders | about partner card | legacy about page | confirm with owner |
| Children from the 3rd grade | home join section, join page | legacy home and join page | confirm with owner |
| Partner descriptions (Jubla Schweiz, Jubla Aargau, J+S) | about | legacy about page | confirmed as association copy; replace the membership numbers as above |
| Leadership names in the imprint | legal | legacy imprint; member records | dynamic from the database; the fallback string omits Saskia Schmid – **fix the fallback or remove it** |
| "Jahreskalender 2026" | events | the PDF in `web/sites/jublawoma/public/assets/documents` was created 2026-01-18 | confirmed |
| Tägerig is part of the catchment area | home, site description | legacy home | confirmed |

## Deliberately not claims

These are editorial voice and do not need a source: "Dein Anlass. Meine
Küche.", "Essen schafft Erinnerungen", "Draussen zuhause", the values copy, the
stories and donation introductions. Do not add new specifics (years, member
counts, awards, capacities) to them without a row here.

## Procedure

1. The owner reviews this table and answers every "confirm" and "fix" row.
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
