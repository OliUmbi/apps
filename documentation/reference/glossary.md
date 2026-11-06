# Glossary

The shared vocabulary. Use these words consistently in code, commits, issues and
documentation. This is a planning vocabulary, not a schema; table-level details
are in [database/README.md](../../database/README.md).

## System terms

| Term | Meaning |
| --- | --- |
| **Site** | A public property and its authorization scope (`jublawoma`, `unclet`, `zelglihof`, `oliumbi`). Not a tenant. |
| **Studio** | The shared administration application at `studio.oliumbi.ch`. The old name "admin" is retired. |
| **Part** | An independently deployable unit: a site or a service. It gets its own directory. |
| **Subsystem** | Shared code that is not independently deployed (packages, the shared Java module). It lives inside the workspace that builds it. |
| **Editor** | A person with a site-scoped permission to manage content. |
| **Role** | A permission string on an account (`studio.admin`, `<site>.manage`). There is no separate role catalog yet. |
| **Actor** | The authenticated account on whose behalf a server function runs. |
| **Submission** | A durable visitor request with a status, reference and retention rule. It is not a transient email. |
| **Message job** | A notification instruction in the queue, independent of the domain data that caused it. |
| **Delivery** | Messaging's record of one email job and its attempts. |
| **Audit event** | A record of a destructive or security-relevant action with actor and time. |

## Content terms

| Term | Meaning |
| --- | --- |
| **Content item** | A managed record with a lifecycle (draft, published, archived). |
| **Article / announcement** | Editorial content. Zelglihof calls the seasonal ones "posts". |
| **Media asset** | An original file plus metadata and derived renditions. Content is immutable; replacing it creates a new asset. |
| **Product offer** | A sellable item with availability and optional variants. |
| **Preorder intent** | A Zelglihof interest signal without payment. It is not an order. |
| **Booking request** | An Uncle-T catering inquiry with a workflow status. |
| **Inquiry** | A contact or event request with a per-site status model. |
| **Review** | A moderated public testimonial with consent. |
| **Donation campaign** | A Jublawoma fundraising window with items and commitments. |
| **Donation commitment** | A donor's promised quantity against a donation item. It is not a payment. |
| **Subscriber** | A newsletter contact with a pending/active/unsubscribed state and consent. |
| **Campaign** | A newsletter send to confirmed subscribers. |

## Per-workflow states

Shared spelling is not shared meaning: each workflow owns its states.

| Workflow | States |
| --- | --- |
| Inquiry (Zelglihof contact) | `new`, `in-progress`, `completed`, `cancelled` |
| Inquiry (Uncle-T event request) | `new`, `in-progress`, `completed`, `cancelled` |
| Product reservation | `new`, `in-progress`, `completed`, `cancelled` |
| Newsletter subscriber | `pending`, `active`, `unsubscribed` |
| Newsletter campaign | `draft`, `queued` |
| Review moderation | no status column; `visible = false` is pending, `true` is published |
| Message delivery | `PENDING`, `PROCESSING`, `SENT`, `FAILED` |
| Message attempt | `SENT`, `RETRY`, `FAILED`, `ABANDONED`, `REJECTED` |

The database enforces these domains with CHECK constraints. Request validation
remains for useful feedback; it is not the enforcement mechanism.

## Naming rules

- **`studio`, not `admin`** for the application. `admin.*` hostnames redirect.
- **`<site>.manage` and `studio.admin`** are the permission strings. Use the
  actual string in code and docs.
- **`part` vs `subsystem`** as defined above; do not call shared packages
  "services".
- **`site`** is a public property. Do not use "tenant" or "brand" for it.
- **`submission`** is the durable visitor request; "form" is only the UI.
- **`queue.message`** is the producer contract; messaging consumes it. Do not
  call the table an outbox (it is an inbox for the consumer).
- **`pre-launch`** means migrations may be edited in place; `live` means data
  exists and expand/contract applies.
