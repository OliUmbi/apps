# OliUmbi Apps

TODO review this

One repository for the OliUmbi websites and the small services they share.
The first implemented vertical slice is the Zelglihof newsletter lifecycle.

The database is being redesigned; the Java/web consumers still need adapting.
Open work is tracked only in [planning/open-work.md](documentation/open-work.md).

## Local development

Requirements: Docker Desktop, Node.js 24+, and pnpm 11+.

```powershell
Copy-Item .env.example .env
docker compose up -d --build
```

This starts the development containers; schema integration is unfinished.
For frontend-only development, keep the database
and services in Docker, then run `pnpm dev:zelglihof` or `pnpm dev:studio` from
`web/` instead. The default local URLs are:

- Zelglihof: http://localhost:8003
- Studio: http://localhost:8000
- Mailpit: http://localhost:8025
- Identity health: http://localhost:8081/actuator/health
- Messaging health: http://localhost:8082/actuator/health

The development maintainer is configured through `.env`. Never use the example
passwords in a deployed environment. Set `STUDIO_SECURE_COOKIES=true` when
Studio is served over HTTPS.

Useful commands:

```powershell
docker compose ps
docker compose logs -f messaging
docker compose down
```

Mailpit catches all development email; the stack does not contact a real SMTP
provider with the example configuration.

## Database

Flyway migrations in `database/migrations/` are the schema source of truth.
Regenerate the readable current snapshot after changing a migration:

```powershell
.\database\schema.ps1
```

See [planning/open-work.md](documentation/open-work.md) for unfinished work.

