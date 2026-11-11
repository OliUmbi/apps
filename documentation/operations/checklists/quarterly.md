# Quarterly drill record

One record per quarter, following [maintenance](../runbooks/maintenance.md). The
point is evidence that updates, recovery and access still work — not a checkbox
exercise.

## Session

| Field | Value |
| --- | --- |
| Quarter | |
| Date (UTC) | |
| Operator | |
| Image tag before the drill | |
| Image tag after the drill | |
| Host / WireGuard endpoint | |

## Host update and reboot

- [ ] Read the changelog for podman and the kernel before upgrading.
- [ ] `apt upgrade` completed without held-back packages that matter.
- [ ] Reboot completed; SSH returns over WireGuard.
- [ ] Every `apps-*` unit is active; every timer is enabled (dyndns per
  cutover state).
- [ ] Blackbox probes recover; no alert is left firing.
- [ ] Certificate expiry is comfortable; DNS records resolve.

Evidence (journal excerpts, unit list, probe state):

## Housekeeping and disk

- [ ] The weekly housekeeping metric is recent.
- [ ] Disk is below the alert threshold; `podman system df` is reasonable.
- [ ] The last week of images is still present (rollback window).
- [ ] Journald is at or below the 200 MB cap.

## Backup and restore

- [ ] The backup timer ran; the success metric is recent.
- [ ] The workstation pull received the newest archive.
- [ ] `sha256sum -c SHA256SUMS` passes on one pulled archive.
- [ ] The restore path was exercised as far as the hardware allows (full drill
  uses [restore-drill](restore-drill.md)).
- [ ] Caddy certificate re-issuance was exercised or the state was verified.

## Access and security

- [ ] Accounts and permissions match the people who should have access.
- [ ] No shared account exists; removed editors are disabled.
- [ ] The vault has no stale credential; rotation dates are current.
- [ ] `restrict_ssh` matches the intended state and the reversal still works.
- [ ] The weekly security workflow is green, or accepted risks are recorded.
- [ ] Host packages and pinned images match the
  [dependency register](../../reference/versions.md).

## Findings

| Finding | Severity | Register entry |
| --- | --- | --- |
| | | |

- [ ] Every finding is in [open work](../../work/open-work.md) or
  [technical debt](../../work/tech-debt.md).
- [ ] The next quarter's drill date is known.

Operator: ____________________  Date: __________
