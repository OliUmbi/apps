# Documentation

The maintained documentation for OliUmbi Apps. It is organized by what you need
to do, not by when a document was written. The shape follows the Diátaxis split
(explanation, reference, how-to) and C4/arc42-style architecture views (context →
containers → components), with separate registers for live work and a frozen
archive for evidence.

| Section | Answers |
| --- | --- |
| [Architecture](architecture/README.md) | What the system is, how the layers fit, and how each subsystem works internally. |
| [Operations](operations/README.md) | How the running system is deployed, backed up, monitored, secured and recovered. |
| [Development](development/README.md) | How to set up, verify and release a change. |
| [Reference](reference/README.md) | Sites and capabilities, decisions, and the shared vocabulary. |
| [Work](work/README.md) | What is unfinished: open tasks, technical debt, migration and open decisions. |
| [History](history/README.md) | Frozen reviews, handoffs and completed execution plans - evidence, not instructions. |

[Principles](principles.md) is the foundation for everything above: why the
project exists, the quality order, and the engineering guidelines.

## Reading paths

**New to the project** - [principles](principles.md) →
[architecture](architecture/README.md) → [layers](architecture/layers.md) →
[local setup](development/local-setup.md) → [verification](development/verification.md).

**Working on a web change** - [web apps](architecture/subsystems/web-apps.md) →
[Studio](architecture/subsystems/studio.md) if the change touches administration
→ [verification](development/verification.md).

**Working on a service or schema change** - [layers](architecture/layers.md) →
the subsystem ([identity](architecture/subsystems/identity.md),
[messaging](architecture/subsystems/messaging.md),
[assets](architecture/subsystems/assets.md),
[data](architecture/subsystems/data-and-schema.md)) → [CI/CD](development/ci-cd.md)
→ [deployment](operations/deployment.md).

**Operating or releasing** - start at the [operations index](operations/README.md)
and follow the runbook for the task (setup, release, backup, incidents).

**Planning what comes next** - [open work](work/open-work.md) →
[technical debt](work/tech-debt.md) → [decisions](reference/decisions.md) →
[migration](work/migration.md).

**Owner or editor** - [sites](reference/sites.md) → the site's launch checklist
→ [open work](work/open-work.md) for the decisions currently waiting on you.

## How the documentation is kept

**One fact, one owner.** Each kind of fact has one canonical page; other pages
link instead of repeating.

| Fact | Owner |
| --- | --- |
| system shape, boundaries, subsystem internals | [architecture](architecture/README.md) |
| deploy, backup, monitoring, access, runbooks | [operations](operations/README.md) |
| setup, verification, CI and release checks | [development](development/README.md) |
| site scope, terms, directions | [reference](reference/README.md) |
| open tasks, debt, migration, decisions needing an owner | [work](work/README.md) |
| past findings and completed plans | [history](history/README.md) |

- **Current vs. history is explicit.** Everything outside `history/` describes
  the system as it is now. `history/` holds review evidence and completed
  plans; it is never silently rewritten.
- **Work has two registers.** Actionable tasks live in
  [work/open-work.md](work/open-work.md). Known structural debt lives in
  [work/tech-debt.md](work/tech-debt.md) with an ID, severity and next action.
  A finding is tracked in exactly one of them.
- **Docs change with behavior.** A change that alters a contract, a command, an
  operational procedure or an invariant updates the page that owns it in the
  same review.
- **Code keeps the nearby detail.** Each deployable unit has its own README.
  This tree explains the system; `web/README.md`, `services/README.md`,
  `database/README.md`, `infrastructure/README.md` and `ansible/README.md` own
  the local detail.

## Adding a document

Place it where a reader would look for it:

- a new operational procedure → a page under `operations/runbooks/` and a row in
  the [runbook index](operations/README.md#runbooks);
- a new subsystem → `architecture/subsystems/` and add it to the subsystem index;
- a new decision → `reference/decisions.md`;
- new unfinished work → `work/open-work.md` or `work/tech-debt.md`;
- a completed execution plan or review → `history/` with a status banner.

No new TODO/FIXME markers in code or docs: put the item in the work registers.
