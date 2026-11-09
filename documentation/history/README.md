# History

Frozen evidence: reviews, handoff reports and completed execution plans. These
documents explain how the current system got here. They are not instructions and
they are not maintained as current documentation.

Read them when you need the evidence behind a decision or the detail of a past
finding. For what to do now, use [work](../work/README.md); for how the system is
now, use [architecture](../architecture/README.md).

| Document | Date | Status |
| --- | --- | --- |
| [Code quality review](code-quality-review.md) | 2026-09-25, dispositions 2026-10 | frozen; live debt moved to [technical debt](../work/tech-debt.md) |
| [Refactoring plan](refactoring-plan.md) | executed 2026-10-26 | complete |
| [Web packages handoff](refactoring-web-packages.md) | 2026-10-25 | historical evidence, superseded by the plan |
| [Web sites handoff](refactoring-web-sites.md) | 2026-10-25 | historical evidence, superseded by the plan |
| [Studio handoff](refactoring-web-studio.md) | 2026-10-25 | historical evidence, superseded by the plan |
| [Services handoff](refactoring-services.md) | 2026-10-25 | historical evidence, superseded by the plan |
| [Deployment plan](deployment-plan.md) | executed 2026-11 | complete |
| [Build and deployment review](deployment-review-2026-11.md) | 2026-11 | review complete; P1 blockers open |
| [First go-live review](go-live-review-2026-11.md) | 2026-11 | review complete; RV-01–RV-04 open, RV-05 fixed |

## Rules

1. **Do not rewrite evidence.** A finding keeps its original description and
   evidence. Corrections are annotations, not silent edits.
2. **Record dispositions in place.** Use
   `*Disposition (YYYY-MM): fixed (work-id) - what changed.*` for fixed,
   already resolved, open, in progress or accepted.
3. **Live work has one home.** If a finding still needs action, its `TD-*` entry
   in [technical debt](../work/tech-debt.md) or its item in
   [open work](../work/open-work.md) is authoritative. The history document keeps
   the evidence and points to it.
4. **Relative links may reflect the old layout.** These documents were written
   before the 2026-11 documentation restructure. Broken relative links are
   expected; the text is preserved on purpose.

## Why they are kept

- The code quality review is the record of what was wrong and what was fixed. It
  prevents re-litigating a closed finding and shows the evidence behind a
  disposition.
- The refactoring handoffs contain the file-level detail and acceptance criteria
  that would otherwise be lost.
- The plans are the record of sequencing and ownership. They prove what was in
  scope, what was deferred, and which decisions were adopted for the pass.
