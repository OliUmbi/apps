# OliUmbi Apps

Monorepo for five web applications, three supporting Java services, and their
shared PostgreSQL schema.

## Applications

| Application | Purpose | Local URL |
| --- | --- | --- |
| Studio | Content and account administration | <http://localhost:8000> |
| Jublawoma | Club website | <http://localhost:8001> |
| Uncle-T | Catering website | <http://localhost:8002> |
| Zelglihof | Farm website | <http://localhost:8003> |
| Oliumbi | Static English placeholder for oliumbi.ch | <http://localhost:8004> |
| Identity | Accounts, sessions, and permissions | <http://localhost:8081> |
| Messaging | Email queue and delivery history | <http://localhost:8082> |
| Assets | Image and document storage | <http://localhost:8083> |

Oliumbi is a static placeholder in its first slice: it has no content data
package and no Java service. Its only runtime dependency is the shared anonymous
page counter. The full personal site is later work; see
[documentation/reference/sites.md](documentation/reference/sites.md).

Start with [documentation/README.md](documentation/README.md) for the reading
order. The web workspace is documented in
[web/README.md](web/README.md), the Java reactor in
[services/README.md](services/README.md), and outstanding work in
[documentation/work/open-work.md](documentation/work/open-work.md) and
[technical debt](documentation/work/tech-debt.md).

## Local development

Requirements: Docker Desktop, Node.js 26+, pnpm 12+, JDK 25, and Maven 3.10.0
(the wrapper pins Maven).

```powershell
Copy-Item infrastructure/.env.dev .env
docker compose -f infrastructure/compose.dev.yaml --env-file .env up -d --build
```

Sites and Studio run at localhost:8000-8004, the services at 8081-8083, and
Mailpit at <http://localhost:8025>. The full workflow, including the
frontend-only setup and environment rules, is in
[documentation/development/local-setup.md](documentation/development/local-setup.md).

## Database

Flyway migrations in `database/migrations/` are the schema source of truth.
Until the baseline freezes at the first accepted production import they are
edited in place, so recreate the local database after a migration changes. See
[database/README.md](database/README.md).

## Verification

Every change ends with the checks in
[documentation/development/verification.md](documentation/development/verification.md).
The short version:

```powershell
cd web
pnpm check
pnpm typecheck
pnpm test
pnpm build

cd ..
services\mvnw.cmd -f services/pom.xml test
```
