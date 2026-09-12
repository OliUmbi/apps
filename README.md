# OliUmbi Apps

Monorepo for four web applications, three supporting Java services, and their
shared PostgreSQL schema.

## Applications

| Application | Purpose | Local URL |
| --- | --- | --- |
| Studio | Content and account administration | <http://localhost:8000> |
| Jublawoma | Club website | <http://localhost:8001> |
| Uncle-T | Catering website | <http://localhost:8002> |
| Zelglihof | Farm website | <http://localhost:8003> |
| Identity | Accounts, sessions, and permissions | <http://localhost:8081> |
| Messaging | Email queue and delivery history | <http://localhost:8082> |
| Assets | Image and document storage | <http://localhost:8083> |

The web workspace is documented in [web/README.md](web/README.md), the Java
reactor in [services/README.md](services/README.md), and outstanding work in
[documentation/open-work.md](documentation/open-work.md).

## Local development

Requirements: Docker Desktop, Node.js 24+, pnpm 11+, JDK 25, and Maven 3.9.12.

The checked-in `.env.development` contains local-only defaults. Override values
through your shell or IDE when needed, and never reuse the development
credentials in a deployed environment.

Start the complete stack from the repository root:

```powershell
docker compose --env-file .env.development up -d --build
```

Mailpit receives development email at <http://localhost:8025>. To work on a
frontend locally while infrastructure stays in Docker, start PostgreSQL,
Flyway, and Mailpit, then run the relevant `pnpm dev:*` command from `web/`.

Set `STUDIO_SECURE_COOKIES=true` whenever Studio is served over HTTPS. Restart
running processes after changing environment values, and rebuild Java services
after changing the shared module.

## Database

Flyway migrations in `database/migrations/` are the schema source of truth.
During development they are edited in place, so recreate the local database
after a migration changes. See [database/README.md](database/README.md) for the
schema ownership summary.

## Verification

```powershell
cd web
pnpm build
pnpm typecheck
pnpm check

cd ../services
mvn test
```
