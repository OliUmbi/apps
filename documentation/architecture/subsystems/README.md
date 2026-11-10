# Subsystems

Each page gives the architecture view of one part: what it owns, how a request
moves through it, which invariants hold, where the code lives, and which known
gaps affect it. Deep local detail stays in the README next to the code.

| Subsystem | Owns | Runs as | Read this when |
| --- | --- | --- | --- |
| [Web apps](web-apps.md) | public SSR sites, the static Oliumbi placeholder, shared web packages | `apps-jublawoma`, `apps-unclet`, `apps-zelglihof`, `apps-oliumbi` | changing a public page, form or shared web package |
| [Studio](studio.md) | administration UI, content editing, authorization boundary | `apps-studio` | changing admin behavior, permissions or content editing |
| [Identity](identity.md) | accounts, sessions, permissions | `apps-identity` | changing sign-in, passwords, sessions or authorization data |
| [Messaging](messaging.md) | queue intake, email delivery, history | `apps-messaging` | changing notifications, retries or delivery visibility |
| [Assets](assets.md) | image/document storage and renditions | `apps-assets` | changing uploads, image delivery or storage |
| [Data and schema](data-and-schema.md) | PostgreSQL schemas, roles, migrations, constraints | `apps-postgres`, `apps-migrate` | touching a table, constraint, role or migration |
| [Edge](edge.md) | TLS, host routing, DNS updates, exposure | `apps-caddy`, `apps-dyndns.timer` | changing a hostname, certificate, header or public port |

## How to read a subsystem page

- **Responsibility** - the one job this part exists to do.
- **Inside** - the main components and their dependency direction.
- **Flow** - the normal call chain and where failure is handled.
- **Invariants** - what a change must not break.
- **Code and operations** - entry points, configuration and health.
- **Known gaps** - links into the work registers, not a second backlog.
