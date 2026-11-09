# Work

What is unfinished, and where each kind of unfinished thing lives.

## At a glance

- **Launch blockers** - the **Launch gate** section of [open work](open-work.md),
  all P1 debt, DR-04–DR-07 and RV-01–RV-04. Execution order and acceptance:
  [first go-live remediation plan](go-live-remediation-plan.md).
- **P1 debt** - [TD-01](tech-debt.md#td-01) proxy rate limiting and
  [TD-14](tech-debt.md#td-14) legacy import validation.
- **Deployment P1 blockers** - DR-04 to DR-07 in
  [open work](open-work.md#build-and-deployment-review-2026-11): role
  provisioning, monitoring permissions, the `latest` default and Studio DNS.
- **Owner choices** - O-006 (account model) and O-010 (schema ownership) in
  [decisions](../reference/decisions.md#still-open), plus the content, legal and
  wording decisions under **Owner decisions** in [open work](open-work.md).

| Register | Holds | Use it when |
| --- | --- | --- |
| [Open work](open-work.md) | actionable tasks grouped by horizon | you need the next thing to do |
| [Technical debt](tech-debt.md) | structural debt with severity, status and next action | you need to judge risk or plan a cleanup |
| [Decisions](../reference/decisions.md) | adopted direction and open questions | a task is blocked on a choice |
| [Migration](migration.md) | legacy replacement phases, data method, cutover | you are planning or executing a cutover |
| [History](../history/README.md) | frozen reviews and completed plans | you need evidence, not a task list |

## The rules

1. **One home per item.** A debt item is not repeated in open work; an open
   question is not repeated in either. Link instead.
2. **A finding keeps its ID.** `R01`, `W-02`, `RS-A1` and friends stay in the
   history document with a disposition; the live register uses its own `TD-*`
   ID and cites the source.
3. **Code-complete is not done.** An item that needs an environment check stays
   open as `[verify]` until the check passes.
4. **Owner decisions are recorded, not coded.** Put the question under **Owner
   decisions**, keep the proposed direction in decisions, and leave the code
   unchanged until the owner confirms.
5. **No TODO/FIXME markers.** A new comment that says "fix later" is a missing
   entry in one of these registers.

## Review rhythm

- **Before a release:** check the launch gate and every P1 debt item.
- **Weekly / when picking up work:** read open work top to bottom; remove what is
  stale, split what is too large, and confirm blocked items still have an owner.
- **After a focused pass:** annotate the source findings, close the register
  entries, and add any follow-up to open work.
- **After a decision:** move the `O-*` question to **Closed questions** in
  decisions, then update or remove the dependent work item.
