# Code quality review

Reviewed on 2026-09-25 against the working tree, including the pending refactor.

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

### R05 — Password changes leave the interface using a revoked session (P2)

[AccountService.changePassword](../services/identity/src/main/java/ch/oliumbi/identity/services/AccountService.java#L90) revokes every account session. [The Studio handler](../web/sites/studio/src/server/profile.functions.ts#L28) does not clear the session cookie, and [the form](../web/sites/studio/src/components/profile/profile-password-form.tsx#L29) only resets its fields. Studio still appears signed in until a later request discovers the revoked session.

- [ ] Complete the password-change workflow by clearing the cookie and refreshing authentication state. Explain that the user must sign in again.

### R06 — Compose omits configuration that Studio actually uses (P1)

[Studio's container environment](../compose.yaml#L147) omits `STUDIO_SECURE_COOKIES` and `ZELGLIHOF_OWNER_EMAIL`. [Authentication](../web/sites/studio/src/server/auth.server.ts#L9) and [newsletter operations](../web/sites/studio/src/server/newsletter.functions.ts#L10) read those variables. Setting them in the file passed to Compose does not forward them automatically. The provided deployment consequently retains insecure-cookie behavior and the fallback sender unless its configuration is extended elsewhere.

- [ ] Pass both settings explicitly. Keep container configuration aligned with the settings consumed by each application.

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

[Public forms](../web/packages/ui/src/use-submission-form.ts#L40) discard field paths and failure reasons. The `required` translation key actually displays the generic message “Bitte prüfe deine Angaben.” [The password form](../web/sites/studio/src/components/profile/profile-password-form.tsx#L24) combines mismatch and complexity failures into one message. Content editors instead concatenate raw schema messages. These approaches make users infer which field needs attention, and the translation names do not clearly describe their broader meaning.

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

### R25 — Inquiry results claim delivery before delivery happens (P3)

[The inquiry service](../web/packages/zelglihof-data/src/inquiry.service.ts#L25) returns `outcome: "sent"` after storing the inquiry and queueing its notification. Actual delivery happens later in messaging and can fail. Uncle-T uses the same naming. This makes an important asynchronous boundary invisible to callers.

- [ ] Name the result `accepted` or `queued`, and reserve `sent` for a confirmed delivery outcome.

### R26 — Overview text is selected by an icon (P3)

[SiteOverview](../web/sites/studio/src/components/site-overview.tsx#L50) chooses its description using `item.icon`. Changing a section's visual icon can therefore change the meaning of its help text. The section model does not say which description belongs to the section.

- [ ] Associate the description with the section or its semantic kind. Keep icon selection independent.

### R27 — Removed components have left substantial dead CSS (P3)

Examples with no matching component usage include [Studio's `.editor-surface`, `.record-detail` and `.editor-index`](../web/sites/studio/src/styles.css#L523), [Jubla's `.event-banner`](../web/sites/jublawoma/src/styles.css#L196) and [`.detail-hero`](../web/sites/jublawoma/src/styles.css#L685), and old field selectors in [Uncle-T](../web/sites/unclet/src/styles.css#L142) and [Zelglihof](../web/sites/zelglihof/src/styles.css#L147). These obsolete rules make visual changes harder to trace.

- [ ] Remove verified dead selectors, including their responsive overrides. Group remaining styles by the feature that owns them. Do not split files solely to meet a line-count target.

### R28 — Shared pagination assumes a site's CSS contract (P3)

[`PaginatedList`](../web/packages/ui/src/paginated-list.tsx#L12) uses a `shell` class supplied by its consumers and fixes the button's visual styling. Its public interface describes data loading but hides those layout requirements. Changing one site's layout can require changing a shared behavior component or overriding it indirectly.

- [ ] Make the layout and control styling explicit through a small composition point, or keep the visual wrapper at each site.

### R29 — List queries and summary models carry detail content (P3)

For example, [showcase listing](../web/packages/unclet-data/src/public.repository.ts#L13) selects the entire row, [the summary adapter](../web/sites/unclet/src/data/showcases.ts#L24) forwards the full body, and [the card](../web/sites/unclet/src/components/showcase-card.tsx#L37) hides most of it with CSS. Other list repositories also select full records before adapters discard fields. Account listing is [unpaginated](../services/identity/src/main/java/ch/oliumbi/identity/services/AccountService.java#L40).

- [ ] Select the fields a list needs and give summaries bounded content. Add bounded account listing before its size becomes significant.

### R30 — Image-size contracts disagree across the service boundary (P2)

[The web asset API](../web/packages/assets/src/urls.ts#L1) includes `original` in its supported image sizes, and [the public proxy](../web/packages/assets/src/public-image.server.ts#L10) forwards it. [Java's ImageSize](../services/assets/src/main/java/ch/oliumbi/assets/domain/ImageSize.java#L25) rejects that value; it uses `master`, which is available only internally. A value accepted by the TypeScript interface therefore produces a bad request. Response validation also accepts any string as a variant size, so it does not expose this drift.

- [ ] Define the public rendition names consistently. Represent the private master separately and keep it unavailable through the public proxy.

## Build and configuration consistency

### R31 — Shared generated code has several writers (P2)

[Every site's i18n plugin](../web/packages/i18n/vite.ts#L7) writes into the same package directory. [The root build](../web/package.json#L6) serializes site builds, but separately started development servers or builds can still generate the same files. Type checking a clean checkout also depends on running builds first. The shared write destination is confirmed; a concurrent-generation failure was not reproduced.

- [ ] Give shared message generation an explicit owner and command. Make route and message generation prerequisites visible without requiring a full production build for type checking.

### R32 — Node types describe a newer runtime than the containers (P2)

[The workspace](../web/pnpm-workspace.yaml#L15) uses Node 26 types, while [the site containers](../web/sites/studio/Dockerfile#L1) run Node 24. The workspace does not declare an `engines` constraint. A successful type check can therefore accept APIs unavailable in the deployed runtime.

- [ ] Align the Node type major with the supported runtime and declare that runtime consistently. Keep versions in the pnpm catalog rather than moving them into child packages.

### R33 — Check commands have inconsistent meanings and incomplete coverage (P3)

[`web/package.json`](../web/package.json#L11) uses `check` for Biome, while child packages use `check` for TypeScript. [Biome's include list](../web/biome.json#L10) excludes package manifests, TypeScript configuration and translation catalogs. Java has no enforced style checks; for example, [AccountSessionRepository](../services/identity/src/main/java/ch/oliumbi/identity/repositories/AccountSessionRepository.java#L6) still imports unused `EntityGraph`. Maven's requested local version is documented but not enforced by a wrapper or version rule.

- [ ] Use consistent script names and cover maintained configuration files. Add a small Java formatting/import check and a reproducible Maven entry point. Keep this separate from expanding the test suite.

### R34 — Container definitions duplicate version and runtime decisions (P3)

[The identity Dockerfile](../services/identity/Dockerfile#L15), messaging and assets hard-code `0.1.0` in their JAR paths, independently of the Maven parent version. The web Dockerfiles also differ in Alpine pinning, copy order, working directory, startup instruction and `NODE_ENV`. Studio copies source before dependency installation; the other sites separate the manifest first. All web runtime stages omit an explicit non-root user, unlike the Java stages.

- [ ] Use a stable Maven output name and one clear container convention. Align runtime settings and base-image policy, preserve dependency-layer caching, and run the web process with an explicit application user. A generator or new container framework is unnecessary.

## Documentation errors

### R35 — The web architecture guide describes removed abstractions (P2)

[The package table](../web/README.md#L12) still assigns generic CRUD helpers to `database` and resource metadata to `contracts`. Those responsibilities are gone, while the shared `ui` package is omitted. [The source-layout section](../web/README.md#L43) says only Studio adds `model`, implies Studio has the public sites' `data` layout, discourages `content` folders that Studio actually uses, and refers to nonexistent `public.types.ts` files. A new contributor receives the wrong map of the codebase.

- [ ] Describe the actual package responsibilities and source layout. Explain the intentional Studio differences and remove conventions the project does not follow.

### R36 — Java setup instructions promise an environment loader that is absent (P2)

[The service guide](../services/README.md#L31), [web guide](../web/README.md#L66) and [assets guide](../services/assets/README.md#L55) claim that Java discovers `.env.development`, supports `APP_ENV_FILE` and no longer needs an IDE environment-file link. No such startup loader exists in the maintained Java sources or resource configuration. [The shared-module description](../services/README.md#L53) also lists environment loading and database configuration that the module does not contain.

- [ ] Document the actual shell, IDE or container configuration path. Do not instruct contributors to remove required environment setup based on a removed implementation.

### R37 — The documented built-site development command does not exist (P2)

[The web guide](../web/README.md#L64) recommends `pnpm --filter studio start:dev` and describes its environment loading. [Studio's scripts](../web/sites/studio/package.json#L5), like the other sites' scripts, provide only `build`, `check`, `dev` and `start`.

- [ ] Replace the example with a working, verified command and accurately describe how it receives environment variables.

### R38 — The asset plan contains completed work as an open correction (P3)

[The asset implementation plan](../services/assets/IMPLEMENTATION_PLAN.md#L75) says image-link primary keys still have invalid `SET NULL` references. The current story, showcase and article image-link migrations already use `ON DELETE CASCADE`. The document mixes an implementation plan, current design and old follow-up work.

- [ ] Remove the stale correction. Keep current lifecycle decisions with the asset documentation and unresolved tasks in open work.

## Keep these choices

- Explicit site data packages, local public view models and thin route composition are the right direction. Another ORM migration is not justified by these findings.
- Drizzle repositories make SQL intent visible. Reservation and donation operations already use transactions and locks; preserve those guarantees while fixing their edge cases.
- Studio checks site access on the server and validates referenced image ownership through assets. Do not replace those checks with client filtering.
- The asset service separates processing, storage and metadata, and documents its single-instance storage limitation. Its immutable content and cleanup design do not need a rewrite.
- Messaging separates queue intake, claiming, SMTP delivery and completion. Preserve that separation and its explicit delivery states.
- pnpm already centralizes dependencies in a strict catalog, and the Maven parent already manages shared dependency versions. Fix the remaining runtime and container inconsistencies around those mechanisms.
- Similar visual markup across independently designed sites is not automatically a defect. Share behavior when that reduces mistakes; do not create a universal page renderer.

## Suggested order

1. Fix profile-field ownership, campaign sending, password-change completion, upload readiness and Studio's missing container settings.
2. Fix quantity precision, submission retries, database invariants and edit conflicts.
3. Simplify Studio's route dependencies and collection capabilities. Keep business states within their owning features.
4. Correct setup documentation and standardize generation, runtime versions and checks.
5. Remove dead styles and tighten smaller naming, query and presentation interfaces.

[Open work](open-work.md) remains the short launch and product checklist. Its role checks, unsaved edits, cancellation policy, submission retries and operational verification are still valid. Existing tests and builds were not rerun for this documentation-only review, and no new tests were added. The findings above do not replace staging verification or the existing deferred testing decision.
