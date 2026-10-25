# Java services

This Maven reactor sits alongside the pnpm workspace in ../web.

- shared: ordinary library JAR for common infrastructure.
- identity: accounts, permissions and sessions.
- messaging: queue intake, email delivery and delivery history.
- assets: asset service.

## Build

Use JDK 25 and Maven 3.9.12. Run these commands from services:

```sh
mvn clean package
mvn -pl identity -am package
mvn -pl messaging -am package
```

The parent POM manages the Java, Spring Boot, Lombok and springdoc versions,
the shared dependency version, and annotation processing. Child POMs declare
the dependencies they actually use. Only applications enable Boot executable
packaging; shared stays a normal JAR.

The reactor builds shared before its consumers without installing or publishing
it. Select a service with -pl and include its dependencies with -am. From the
repository root, add -f services/pom.xml.

For local execution, build first and run the application's main class in the IDE
or its packaged JAR, for example java -jar identity/target/identity-0.1.0.jar.
Each service reads Spring configuration from `src/main/resources/application.yaml`.
Supply the referenced environment variables through your shell or IDE run
configuration. An IDE environment-file loader can use the root `.env`
(copied from `infrastructure/.env.dev`), which contains local-only defaults.
The applications do not read that file themselves and do not implement
`APP_ENV_FILE`.

Import services/pom.xml as the Maven project in IntelliJ so all modules are linked.

## Tests

Every module carries permanent unit tests: shared covers the internal
bearer-token verification, identity covers input normalization, passwords,
tokens, sessions and permissions plus the controller/error contract, messaging
covers domain, intake, delivery and worker, and assets covers processing and
storage. The suites run without a database or SMTP server.

Run them from services with `mvn test` (from the repository root:
`mvn -f services/pom.xml test`). `mvn` is not necessarily on the PATH — install
Maven locally or use the IDE's bundled Maven; the command stays the same.

Remaining follow-ups: integration tests against a real PostgreSQL, Java style
checks, and running the reactor's checks in CI alongside the web checks.

## Containers

Run `docker compose -f infrastructure/compose.dev.yaml --env-file .env up -d --build identity messaging assets`
from the repository root. Compose forwards the variables declared in each service's
`environment` section; `--env-file` alone does not pass every variable to a container.
All three Dockerfiles use services as their build context and build the selected
application plus shared through the reactor. They do not depend on locally
installed shared artifacts. Generated target directories are excluded.

## Shared code

The `shared` module provides the UTC clock, OpenAPI setup, API exception handling
and internal bearer-token verification. Each service owns its application and
database configuration. Domain behavior remains in the service that owns it. Consumers
import `shared` through the reactor rather than a separately installed artifact.

## API contract

API documentation is served at `/docs` (Swagger UI over the OpenAPI description
from shared) only when the `dev` Spring profile is active; outside that profile
springdoc is disabled and `/docs` does not exist. `/actuator/health` stays
reachable without authentication for the compose health checks.

Every error response is a problem response carrying `errorId`, a per-request
correlation id that is also written to the service log. Request-validation
failures additionally carry `errors`, a list of `{"field": …, "message": …}`
entries. Status codes and `detail` texts are unchanged — including the reason
texts of explicitly raised HTTP failures — so existing callers keep working;
the envelope only adds fields.
