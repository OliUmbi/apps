# Code quality review

Reviewed on 2026-09-25 against the working tree, including the pending refactor.

Follow-up status: **10 findings resolved; 28 remain open.** Resolved: R05–R06, R25–R27, R30 and R35–R38. R33 also has a completed import cleanup; its tooling work remains open. The latest change completes password-change sign-out; other workflow, database and architecture changes remain open.

## Assessment and scope

The project has useful boundaries, but it is not yet consistently simple to reason about. The main problems are incomplete workflow contracts, generic interfaces that hide domain rules, and documentation that describes removed code. Another broad rewrite would add risk. Fix the concrete boundaries below in small changes.

This is a static review of the four web applications, shared web packages, Java services, SQL migrations, build configuration and maintained documentation. Generated files, dependencies, build output and the ignored legacy tree are excluded. Source paths and call chains were checked; concurrent requests, production deployment and authenticated browser workflows were not exercised in this review. The decimal arithmetic example below was reproduced separately. This is not a claim that every possible defect has been found.

Priorities:

- **P1:** fix before relying on the affected workflow or deployment.
- **P2:** fix in the next focused cleanup; these are correctness or maintainability gaps.
- **P3:** smaller cleanup or a limitation to address when the feature grows.

## Workflow and data boundaries

### R01 — Profile editing can undo an administrative account change (P1)

[Profile updates](../web/sites/studio/src/server/profile.functions.ts#L17) read `enabled` and send it back through the general account update API. [AccountService](../services/identity/src/main/java/ch/oliumbi/identity/services/AccountService.java#L67) then writes that value under its own lock. If an administrator disables the account between those requests, the profile update can set it back to enabled. Locking the later write does not make the earlier read atomic.

- [ ] Give profile changes an operation that updates only name and email. Keep administrative fields inside the identity service's administrative operation.

### R02 — Donation quantities lose decimal precision (P2)

[The schema](../web/packages/jublawoma-data/src/schema.ts#L91) reads SQL `numeric` as JavaScript numbers, and [the commitment sum](../web/packages/jublawoma-data/src/donation.repository.ts#L31) is also converted to `Number`. [The capacity check](../web/packages/jublawoma-data/src/donation.service.ts#L24) uses exact floating-point comparison. With a target of `0.3`, an existing commitment of `0.2` and a new commitment of `0.1`, the sum is `0.30000000000000004` and the valid commitment is rejected. The increment tolerance does not protect this check.

- [ ] Choose one quantity precision policy. Use exact decimal arithmetic, integer units, or database numeric arithmetic for capacity checks.

### R03 — Image uploads do not participate in editor save state (P2)

[ImageField](../web/sites/studio/src/components/content/image-field.tsx#L42) owns its upload mutation and changes the selected image only after completion. [CollectionView](../web/sites/studio/src/components/content/collection-view.tsx#L110) disables saving only during the record mutation. An editor can start replacing an image and save the previous image before the upload finishes. A late upload result may then change local state or be discarded when the form remounts.

- [ ] Expose upload readiness to the editor and prevent saving an incomplete image selection.

### R04 — Campaign sending is disconnected from unsaved edits (P1)

[CampaignsView](../web/sites/studio/src/components/content/zelglihof/campaign-view.tsx#L63) renders sending separately from the form. [CampaignSend](../web/sites/studio/src/components/campaign-send.tsx#L15) passes only the record ID, and [the service](../web/packages/zelglihof-data/src/campaign.service.ts#L39) reads the saved body. Editing a draft and choosing Send can therefore queue the old text while the new text is still visible. Sending changes the status to queued and removes the editor.

- [ ] Require a saved draft before sending, and make the confirmation refer to the exact saved version being queued.

### R05 — Password changes leave the interface using a revoked session (resolved)

[The Studio handler](../web/sites/studio/src/server/profile.functions.ts#L28) now clears the session cookie after Identity confirms the password change. [The form](../web/sites/studio/src/components/profile/profile-password-form.tsx#L17) then refreshes authentication state, so the route returns to login and replaces the authenticated query provider. The help text explains sign-out before submission. Failed password updates preserve the cookie and show the existing error feedback.

- [x] Clear the cookie only after a successful password update, refresh authentication state and explain that the user must sign in again. Identity's session revocation behavior is unchanged.

### R06 — Compose omits configuration that Studio actually uses (resolved)

[Studio's container environment](../compose.yaml#L147) now explicitly forwards `STUDIO_SECURE_COOKIES` and `ZELGLIHOF_OWNER_EMAIL`. The HTTP development default remains `false`; HTTPS deployments must set secure cookies to `true` as documented.

- [x] Pass both settings explicitly. Compose configuration validation confirmed that supplied values reach Studio.

### R07 — Database constraints do not enforce application invariants (P2)

[Donation items](../database/migrations/V008__jublawoma.sql#L75), [reviews](../database/migrations/V009__unclet.sql#L26), [product stock](../database/migrations/V010__zelglihof.sql#L53) and [subscriber status](../database/migrations/V010__zelglihof.sql#L86) lack corresponding value checks. Negative stock, invalid star counts, nonpositive donation steps and unknown statuses remain valid SQL rows. The TypeScript enum hints in Drizzle do not constrain these text columns in PostgreSQL.

- [ ] Add the agreed numeric, status and date-range constraints in Flyway. Keep request validation for useful feedback. Verify imported data against the same rules.

### R08 — Ordinary content saves silently overwrite concurrent edits (P2)

[ContentForm](../web/sites/studio/src/components/content/content-form.tsx#L37) edits a local snapshot. Updates such as [product updates](../web/packages/zelglihof-data/src/content/product.repository.ts#L46) replace all editable fields and match only the ID. Two editors can save different changes and silently discard the first editor's work. `updatedAt` is written but never used to detect this conflict.

- [ ] Add a small optimistic-concurrency contract for managed content. Report a conflict and let the editor reload instead of silently overwriting changes.

### R09 — Record deletion hides business lifecycle decisions (P2)

[Reservation creation](../web/packages/zelglihof-data/src/reservation.service.ts#L29) reduces stock, but [reservation updates and deletion](../web/packages/zelglihof-data/src/content/product-reservation.repository.ts#L36) only change or remove the row. [Campaign deletion](../web/packages/zelglihof-data/src/content/campaign.repository.ts#L62) also removes a queued campaign without affecting queued messages. Generic CRUD makes these operations appear complete even though their business consequences differ.

- [ ] Define reservation cancellation and stock restoration before presenting cancellation as complete. Keep queued campaign deletion distinct from cancellation. These policy decisions already appear in open work.

### R10 — Retried submissions can repeat committed work (P2)

[Reservations](../web/packages/zelglihof-data/src/reservation.service.ts#L17) generate a fresh ID for every request. [Donation commitments](../web/packages/jublawoma-data/src/donation.repository.ts#L43) also have no submission identity. If the transaction succeeds but its response is lost, a retry can create another commitment or reduce stock again. Queue deduplication by message ID does not identify the repeated business request.

- [ ] Give these submissions a stable request identity and return the original outcome on retry. Keep the check in the transaction. This is already tracked in open work.

### R11 — Dirty editor state does not reach navigation (P2)

[ContentForm](../web/sites/studio/src/components/content/content-form.tsx#L41) tracks whether values changed, but uses that state only to hide the saved message. [RoutedCollectionView](../web/sites/studio/src/components/content/routed-collection-view.tsx#L31) remounts the workspace on navigation. Back, section changes and leaving the page can discard edits without a warning.

- [ ] Expose dirty state through a small editor lifecycle contract and protect navigation. Cover nested editors as well as the main record. This is already tracked in open work.

## Architecture and responsibilities

### R12 — Studio components import the route that imports them (P2)

[The index route](../web/sites/studio/src/routes/index.tsx#L3) imports `DashboardView`, while [DashboardView](../web/sites/studio/src/components/dashboard-view.tsx#L10) imports that route. [RoutedCollectionView](../web/sites/studio/src/components/content/routed-collection-view.tsx#L3) imports it too. Navigation and rendering form a module cycle, so using a low-level collection component pulls in the dashboard's composition root.

- [ ] Keep route composition at the top. Pass the relevant navigation state down, or use a route API boundary that does not import the component-owning module.

### R13 — The collection API accepts combinations it cannot render correctly (P2)

[CollectionSource](../web/sites/studio/src/model/collection.ts#L15) makes reading, creating and updating individually optional but requires removal. [CollectionView](../web/sites/studio/src/components/content/collection-view.tsx#L15) adds an optional editor and several optional rendering callbacks. A create function without an editor type-checks but produces an empty creation workspace. [useCollection](../web/sites/studio/src/hooks/use-collection.ts#L47) must discover other invalid combinations at runtime.

- [ ] Model read-only, editable and creatable capabilities explicitly, or compose a list and editor separately. Keep useful shared table behavior; avoid rebuilding a universal CMS configuration language.

### R14 — Unrelated workflows share one global status model (P2)

[`statusValues` and `statusSchema`](../web/packages/contracts/src/validation.ts#L36) define one lifecycle for both [inquiries](../web/packages/unclet-data/src/content/inquiry.ts#L12) and [product reservations](../web/packages/zelglihof-data/src/content/product-reservation.ts#L12). Adding a reservation-specific state would also widen inquiry inputs and affect their editors. Shared spelling is being treated as shared domain meaning.

- [ ] Let each workflow own its allowed states. Share presentation or validation primitives only where their meaning is actually the same.

### R15 — Package exports do not describe a deliberate public interface (P2)

Data packages such as [zelglihof-data](../web/packages/zelglihof-data/package.json#L7) export their entire source tree with a wildcard. Internal repositories and table declarations are therefore available alongside supported contracts. Studio consumes [record types inferred directly from Drizzle tables](../web/packages/zelglihof-data/src/content/product.ts#L16). Public site components now use local view models, but Studio's read contracts remain tied to storage shape.

- [ ] Define the supported package entry points and separate managed-content contracts from repository internals where independent evolution is needed. Keep Drizzle inside data packages; avoid duplicating every row type without a concrete boundary benefit.

### R16 — Authorization depends on remembering checks in each handler (P3)

[Content handlers](../web/sites/studio/src/server/content/zelglihof/product.functions.ts#L16) repeatedly call `requireActor`, and Java management controllers repeat bearer-token checks. The inspected handlers contain these checks, including image ownership checks. The weakness is that a new handler can compile without following the convention.

- [ ] Make authorization an explicit part of server-function or controller setup, using a small local mechanism. Keep site-specific ownership checks close to the operation. No missing authorization check was established by this finding.

### R17 — Queue permissions exceed the producer interface (P2)

[The grants](../database/migrations/V001__schemas.sql#L50) allow public site roles to select all queue tables. [The queue schema](../database/migrations/V002__queue.sql#L1) contains recipients, message bodies and site identifiers, but has no site isolation. [The web producer](../web/packages/queue/src/index.ts#L7) only needs to enqueue messages. Separate site database roles therefore do not isolate queued personal data from one another.

- [ ] Narrow queue privileges to the producer's actual needs, including any columns needed for conflict handling. Enforce site ownership for producer writes. Keep queue consumption with messaging.

### R18 — Asset cleanup is not bounded by the amount of work scanned (P2)

[OrphanCleanup](../services/assets/src/main/java/ch/oliumbi/assets/services/storage/OrphanCleanup.java#L47) caps removals, but can still examine every retained asset and query the database for each one. [The metadata lookup and deletion](../services/assets/src/main/java/ch/oliumbi/assets/services/storage/OrphanCleanup.java#L56) run while holding the same lock used to start and finish uploads. Slow database calls can therefore block upload coordination.

- [ ] Bound examined entries or elapsed work and shorten the coordination lock. Preserve active-upload protection and resume scanning across runs.

### R19 — Campaign batching does not bound the transaction (P3)

[`queueRecipients`](../web/packages/zelglihof-data/src/campaign.service.ts#L9) reads batches of 100, but processes every recipient in one transaction and inserts each message separately. Subscriber share locks remain held until that transaction commits. The batch constant limits memory, not request duration, lock duration or total database work.

- [ ] Set an explicit supported campaign size for the current design. If volume grows, use a resumable queueing operation with stable recipient identities. Preserve the current atomic behavior until that replacement is designed.

## Interfaces, naming and presentation code

### R20 — Public form configuration loses the input type (P2)

[`SubmissionField.name`](../web/sites/zelglihof/src/components/submission-control.tsx#L6) is a plain string. [`numberFields` and defaults](../web/packages/ui/src/use-submission-form.ts#L16) also accept arbitrary keys. A renamed domain field can leave an old form key behind and still compile. The broad field shape also permits incompatible options such as numeric settings on a text area. The same control model is repeated across three sites.

- [ ] Tie field names and defaults to the input type, and distinguish supported control kinds. Share behavior where useful while keeping each site's visual design local.

### R21 — Validation errors lose their actual meaning (P2)

[Public forms](../web/packages/ui/src/use-submission-form.ts#L40) discard field paths and failure reasons. The `required` translation key actually displays the generic message “Bitte prüfe deine Angaben.” [The password form](../web/sites/studio/src/components/profile/profile-password-form.tsx#L28) combines mismatch and complexity failures into one message. Content editors instead concatenate raw schema messages. These approaches make users infer which field needs attention, and the translation names do not clearly describe their broader meaning.

- [ ] Preserve field paths and a small set of validation reasons. Translate them consistently and associate errors with their fields.

### R22 — Service errors discard actionable information (P2)

[The HTTP client](../web/packages/http-client/src/index.ts#L30) keeps only the service name and status for failed responses. It drops the Java problem response and its error ID. Studio frequently reduces conflicts, expired authentication and service outages to the same generic message. Callers cannot reliably choose between reloading, signing in again and retrying.

- [ ] Carry safe error codes, status and correlation IDs across the service boundary. Handle expected outcomes explicitly without exposing internal exception details.

### R23 — Failure logging removes too much diagnostic evidence (P2)

[ApiExceptionHandler](../services/shared/src/main/java/ch/oliumbi/shared/web/ApiExceptionHandler.java#L53) logs a class name and a shortened top-level stack but discards the cause chain. [MessageWorker](../services/messaging/src/main/java/ch/oliumbi/messaging/services/processing/MessageWorker.java#L35) logs only the exception class. [EmailDelivery](../services/messaging/src/main/java/ch/oliumbi/messaging/services/delivery/EmailDelivery.java#L40) catches all exceptions, and unknown failures become retryable without retaining diagnostics. Programming errors and infrastructure failures become difficult to distinguish.

- [ ] Retain structured cause information and correlation IDs in internal logs, with personal data redacted. Distinguish expected delivery failures from unexpected code failures.

### R24 — Product adapters duplicate business policy and embed translated text (P2)

[The product adapter](../web/sites/zelglihof/src/data/products.ts#L12) calculates reservation availability with the web process clock and supplies German labels. [The reservation repository](../web/packages/zelglihof-data/src/reservation.repository.ts#L19) independently evaluates the same time window using the database clock. The display and command paths can drift as availability rules evolve, and localization is mixed into record conversion.

- [ ] Give availability one explicit policy and time basis. Keep the write-time check authoritative. Return meaningful state and let the presentation layer choose its translated label.

### R25 — Inquiry results claim delivery before delivery happens (resolved)

The [Zelglihof](../web/packages/zelglihof-data/src/inquiry.service.ts#L25) and [Uncle-T](../web/packages/unclet-data/src/inquiry.service.ts#L25) inquiry services now return `outcome: "accepted"`. This describes the stored inquiry and queued notification without claiming delivery.

- [x] Rename both inquiry outcomes and check their consumers. Queue and delivery behavior are unchanged.

### R26 — Overview text is selected by an icon (resolved)

[Studio sections](../web/sites/studio/src/model/content-sections.ts) now declare their own description functions. [SiteOverview](../web/sites/studio/src/components/site-overview.tsx) renders that description directly. Changing an icon no longer changes the help text, and translation functions are evaluated when rendering.

- [x] Associate descriptions with their sections and remove the icon-based description mapping.

### R27 — Removed components have left substantial dead CSS (resolved)

Removed 46 obsolete selectors and their responsive overrides across [Studio](../web/sites/studio/src/styles.css), [Jubla](../web/sites/jublawoma/src/styles.css), [Uncle-T](../web/sites/unclet/src/styles.css) and [Zelglihof](../web/sites/zelglihof/src/styles.css). Component and shared UI sources were checked for each removed class. Shared rules retain their live selectors. Jubla's highlighted page titles now use an explicit `page-title-accent` class to avoid unrelated specificity warnings.

- [x] Remove the verified obsolete styles without restructuring the stylesheets or changing the intended design.

### R28 — Shared pagination assumes a site's CSS contract (P3)

[`PaginatedList`](../web/packages/ui/src/paginated-list.tsx#L12) uses a `shell` class supplied by its consumers and fixes the button's visual styling. Its public interface describes data loading but hides those layout requirements. Changing one site's layout can require changing a shared behavior component or overriding it indirectly.

- [ ] Make the layout and control styling explicit through a small composition point, or keep the visual wrapper at each site.

### R29 — List queries and summary models carry detail content (P3)

For example, [showcase listing](../web/packages/unclet-data/src/public.repository.ts#L13) selects the entire row, [the summary adapter](../web/sites/unclet/src/data/showcases.ts#L24) forwards the full body, and [the card](../web/sites/unclet/src/components/showcase-card.tsx#L37) hides most of it with CSS. Other list repositories also select full records before adapters discard fields. Account listing is [unpaginated](../services/identity/src/main/java/ch/oliumbi/identity/services/AccountService.java#L40).

- [ ] Select the fields a list needs and give summaries bounded content. Add bounded account listing before its size becomes significant.

### R30 — Image-size contracts disagree across the service boundary (resolved)

[The asset types](../web/packages/assets/src/urls.ts) now distinguish public renditions from stored variants, which also include the private `master`. The public proxy uses only public sizes, the internal client accepts known variants, and response validation checks those names against an enum. The unsupported `original` image size is gone.

- [x] Align rendition names with Java and keep the master out of public image URLs.

## Build and configuration consistency

### R31 — Shared generated code has several writers (P2)

[Every site's i18n plugin](../web/packages/i18n/vite.ts#L7) writes into the same package directory. [The root build](../web/package.json#L6) serializes site builds, but separately started development servers or builds can still generate the same files. Type checking a clean checkout also depends on running builds first. The shared write destination is confirmed; a concurrent-generation failure was not reproduced.

- [ ] Give shared message generation an explicit owner and command. Make route and message generation prerequisites visible without requiring a full production build for type checking.

### R32 — Node types describe a newer runtime than the containers (P2)

[The workspace](../web/pnpm-workspace.yaml#L15) uses Node 26 types, while [the site containers](../web/sites/studio/Dockerfile#L1) run Node 24. The workspace does not declare an `engines` constraint. A successful type check can therefore accept APIs unavailable in the deployed runtime.

- [ ] Align the Node type major with the supported runtime and declare that runtime consistently. Keep versions in the pnpm catalog rather than moving them into child packages.

### R33 — Check commands have inconsistent meanings and incomplete coverage (P3)

[`web/package.json`](../web/package.json#L11) uses `check` for Biome, while child packages use `check` for TypeScript. [Biome's include list](../web/biome.json#L10) excludes package manifests, TypeScript configuration and translation catalogs. Java has no enforced style checks. Maven's requested local version is documented but not enforced by a wrapper or version rule.

- [x] Remove the unused `EntityGraph` import from `AccountSessionRepository`.
- [ ] Use consistent script names and cover maintained configuration files. Add a small Java formatting/import check and a reproducible Maven entry point. Keep this separate from expanding the test suite.

### R34 — Container definitions duplicate version and runtime decisions (P3)

[The identity Dockerfile](../services/identity/Dockerfile#L15), messaging and assets hard-code `0.1.0` in their JAR paths, independently of the Maven parent version. The web Dockerfiles also differ in Alpine pinning, copy order, working directory, startup instruction and `NODE_ENV`. Studio copies source before dependency installation; the other sites separate the manifest first. All web runtime stages omit an explicit non-root user, unlike the Java stages.

- [ ] Use a stable Maven output name and one clear container convention. Align runtime settings and base-image policy, preserve dependency-layer caching, and run the web process with an explicit application user. A generator or new container framework is unnecessary.

## Documentation errors

### R35 — The web architecture guide describes removed abstractions (resolved)

[The web guide](../web/README.md) now describes the actual database helpers, shared UI package, public view models and Studio directory layout. It distinguishes public repositories from site adapters and explains Studio's managed-content folders.

- [x] Correct package responsibilities, source layout and file conventions. Remove references to deleted abstractions.

### R36 — Java setup instructions promise an environment loader that is absent (resolved)

[The service](../services/README.md), [web](../web/README.md) and [assets](../services/assets/README.md) guides now describe shell, IDE and Compose configuration. They no longer promise automatic environment-file discovery or `APP_ENV_FILE` support. The shared-module description now lists its actual responsibilities. The root guide also identifies which supporting services a native frontend needs.

- [x] Correct Java environment setup and shared-module documentation without adding a new loader.

### R37 — The documented built-site development command does not exist (resolved)

[The web guide](../web/README.md) now gives a Node command that explicitly loads the shared development file and runs the built site. It distinguishes this from the existing `start` script, which expects externally supplied environment variables.

- [x] Replace the nonexistent script example. Check the environment-file loading and built entry-point path.

### R38 — The asset plan contains completed work as an open correction (resolved)

[The asset design notes](../services/assets/IMPLEMENTATION_PLAN.md#L75) now describe the existing `CASCADE` behavior for image links and `SET NULL` behavior for optional content references. The obsolete migration correction is removed, with a link to the database migration policy.

- [x] Replace the stale task with the implemented foreign-key behavior.

## Keep these choices

- Explicit site data packages, local public view models and thin route composition are the right direction. Another ORM migration is not justified by these findings.
- Drizzle repositories make SQL intent visible. Reservation and donation operations already use transactions and locks; preserve those guarantees while fixing their edge cases.
- Studio checks site access on the server and validates referenced image ownership through assets. Do not replace those checks with client filtering.
- The asset service separates processing, storage and metadata, and documents its single-instance storage limitation. Its immutable content and cleanup design do not need a rewrite.
- Messaging separates queue intake, claiming, SMTP delivery and completion. Preserve that separation and its explicit delivery states.
- pnpm already centralizes dependencies in a strict catalog, and the Maven parent already manages shared dependency versions. Fix the remaining runtime and container inconsistencies around those mechanisms.
- Similar visual markup across independently designed sites is not automatically a defect. Share behavior when that reduces mistakes; do not create a universal page renderer.

## Suggested order

1. Fix profile-field ownership, campaign sending and upload readiness.
2. Fix quantity precision, submission retries, database invariants and edit conflicts.
3. Simplify Studio's route dependencies and collection capabilities. Keep business states within their owning features.
4. Standardize generation, runtime versions and checks.
5. Tighten the remaining query, naming and presentation interfaces.

[Open work](open-work.md) remains the short launch and product checklist. Its role checks, unsaved edits, cancellation policy, submission retries and operational verification are still valid.

The small-fix follow-up passed `pnpm check`, `pnpm typecheck`, all four production builds and Compose configuration validation. Public image-size names were compared with the Java enum, and documentation links were checked. No tests were added. Java was not rebuilt for the unused-import removal, and authenticated workflows were not exercised. These checks do not replace staging verification or the existing deferred testing decision.

The R05 follow-up passed Studio's build, type check and lint check. An isolated check of the actual server handler confirmed that cookie clearing waits for success, service failures preserve the cookie and unauthenticated requests cannot update a password. No test files were added. A complete browser flow against Identity remains part of staging verification.
