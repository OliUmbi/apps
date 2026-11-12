# Second code review (2026-11)

**Date:** 2026-11-13 · **Reviewed state:** `5a0ec3e` · **Status:** dispositions
recorded; live follow-ups are in the registers.

A second full-codebase review covered web, services/database,
infrastructure/security, tests/CI and docs. It found no high-severity issue: two
medium and twenty low/informational items. The `R-*` IDs below are local to this
review; the historical `R-*` IDs in
[the 2026-09 review](code-quality-review.md) are unrelated.

| ID | Finding | Disposition |
| --- | --- | --- |
| R-01 | Dead legacy `useSubmissionForm` overload | fixed in `8a6ee90` |
| R-02 | Studio audit schema layer exception undocumented | fixed in `9fe0f00` |
| R-03 | Messaging client schema omitted `sender`/`lockedAt` | fixed in `2031878` |
| R-04 | Identity session fields unbounded | fixed in `a92612f` |
| R-05 | Stale “unused oliumbi” role comment | fixed in `1cd19de` |
| R-06 | Dev compose ports bound to every interface | fixed in `4697e1b` |
| R-07 | Four sites had no nearby README | fixed in `9fe0f00` |
| R-08 | Missing FK indexes on site schemas | fixed in `c94b22f` |
| R-09 | Unnamed messaging lifecycle CHECKs | fixed in `c94b22f` |
| R-10 | Queue partial index needed only for a second channel | noted at the index in `c94b22f`; no change now |
| R-11 | Public document endpoint has no site/edge consumer | removed in `0135aed`; documents stay management-only |
| R-12 | Monitoring units lacked capability/no-new-privileges hardening | fixed in `36196aa`; host verification remains in the [go-live checklist](../operations/checklists/go-live.md) |
| R-13 | Caddy admin API trust boundary undocumented | documented in `091d58d`; accepted as [TD-24](../work/tech-debt.md#td-24) |
| R-14 | Off-host backup pull was manual-only | script/docs fixed in `1cd19de`; installation and a real pull are in [open work](../work/open-work.md) |
| R-15 | CSP still allows inline scripts/styles | accepted already in TD-02/D22; no change |
| R-16 | Java job did not prove persistence suites ran | fixed in `3691a3f` |
| R-17 | Stale committed route trees could pass CI | fixed in `3691a3f` |
| R-18 | Compose config check documented as CI but local-only | docs corrected in `3691a3f` |
| R-19 | i18n package excluded its own `vite.ts` | fixed in `3e7bf34` |
| R-20 | Messaging/environment packages lacked direct tests | messaging contract test in `2031878`; environment accepted as build-time glue in TD-13 |
| R-21 | Dangling “translation audit” reference | removed with the review docs |
| R-22 | Register bookkeeping | this table plus the register entries above |

## What stayed healthy

The review reconfirmed the layering rules, row-locked capacity paths, typed
boundaries, server-side Studio authorization, secret hygiene, pinned CI inputs
and the full test/build gate. No finding required a design change.

## Follow-ups

- Monitoring hardening (R-12) needs a host check after the next deploy.
- The backup pull schedule (R-14) needs one real scheduled pull.
- TD-24 (Caddy admin API) is accepted for the single-tenant network and becomes
  live work only if `net-apps` gains untrusted containers.
