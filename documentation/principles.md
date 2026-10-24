# Principles

Why the project exists, what good looks like, and how to break ties. The
quality order at the bottom is the tiebreaker when things conflict.

## Product goal

OliUmbi Apps builds, manages and operates several websites with distinct
identities and feature sets inside one maintainable project:

- `jublawoma.ch` — the Jubla Woma association
- `uncle-t.ch` — a catering business
- `zelglihof-maegenwil.ch` — a farm, its products and services
- `oliumbi.ch` — personal site and experiment space

Studio, the shared administration app, is a primary part of the product, not an
afterthought. Oliumbi itself is secondary to the three community and business
sites.

## What success looks like

- **Visitors**: each site feels like its own product; pages work on slow
  connections; forms validate, show a clear result and cannot be double
  submitted; old URLs keep working or redirect; legal and privacy content is
  complete at launch.
- **Owners and editors**: content that changes is editable without a code
  release; roles see only their sites; uploads follow a retention policy;
  bookings, donations, reviews and requests have explicit states and cannot
  vanish between a browser response and an email.
- **Maintainer**: a new site follows documented conventions; one site can be
  built, deployed and rolled back without touching the others; shared code has
  one owner and one reason to exist; local development has one documented entry
  path; one person can diagnose failures from logs, metrics, backups and
  restores.

## Confirmed constraints

Low traffic, one primary developer, TypeScript in the browser, TanStack Start
for web, PostgreSQL as the datastore, Docker Compose for deployment, GitHub
Actions for CI/CD. Backend components may use other languages when a stable
contract and a clear benefit justify the toolchain.

## Engineering principles

1. **Smallest complete system.** Simplicity covers the whole lifecycle,
   including operations. Choose the smallest design that safely handles current
   requirements with an obvious evolution path. Do not design for hypothetical
   traffic.
2. **Sites are independent.** The repository is shared, runtime fate is not.
   Each site has its own routes, content, build, image and release; an
   experimental Oliumbi change must never force a Jublawoma release.
3. **Share proven concepts, not visual coincidence.** Code starts in a site and
   moves to `web/packages/` only after two sites need the same stable behavior
   or a contract must be uniform. A universal component layer that blocks
   site-specific design is not a goal.
4. **Logical boundaries before process boundaries.** Content, identity, media
   and messaging are distinct capabilities with explicit ownership; they become
   separate processes only when runtime, security, reliability or language needs
   justify the cost. See [architecture.md](architecture.md).
5. **Libraries as libraries.** Use documented extension points and ecosystem
   conventions. Do not rebuild routing, DI, validation, migrations,
   authentication or SQL mapping without a measured need.
6. **Strict boundaries, flexible internals.** Everything crossing a browser,
   process, job, database or provider boundary is validated and versioned
   deliberately. Inside, small expressive functions; no ceremonial layers.
7. **Design failure paths with the happy path.** Every write, message,
   migration, deployment and restore answers: partial failure, retry, duplicate
   execution, visibility, rollback. Low traffic reduces capacity needs, not
   correctness needs.
8. **Experiments are reversible.** Experiments have a question, a time boundary
   and a removal path. Beta dependencies are fine in prototypes; production
   adoption needs an owner, an upgrade path and a fallback.

## Code guidelines

- Short, precise, domain-based names. Small functions and components with one
  reason to change.
- Pure transformations and explicit side effects. At a library boundary,
  convert at the edge instead of letting foreign logic into business code;
  treat errors as values that must be handled (the Result discipline), not as
  surprises.
- Validate at entry points; TypeScript types do not exist at runtime.
- Site-specific wording, layout and branding stay in the site.
- Accessibility, responsive behavior, metadata and error states are part of the
  feature, not polish.
- Comments explain constraints and rationale, never restate code.
- Every deployable unit keeps a nearby README: setup, configuration, contracts,
  health and commands.
- Use one ubiquitous language per domain; the shared vocabulary lives in
  [sites.md](sites.md). A second developer works on this code.

## Non-goals

One hostname-switched single-page app. Rebuilding every legacy feature before
shipping. A custom general-purpose framework. Microservices by default. One
visual abstraction for all brands. Tenant or website-builder products.
Kubernetes, autoscaling or multi-region without a demonstrated need. Keeping
legacy implementation details when the need can be met more simply.

## Quality attributes, in order

1. Data integrity and security
2. Recoverability and operational clarity
3. Maintainability and understandability
4. Accessibility and user correctness
5. Independent delivery and development speed
6. Performance appropriate to public websites
7. Extensibility for known next steps
8. Scalability beyond current traffic

This does not excuse poor performance or slow delivery. It stops a convenient
shortcut from risking private data, content, or the ability to recover.
