# Shared Java library

The implemented workspace is a Maven reactor under services:

```text
services/
  pom.xml
  shared/pom.xml
  identity/pom.xml
  messaging/pom.xml
  assets/pom.xml
web/
  pnpm-workspace.yaml
```

services/pom.xml is both aggregator and parent. It inherits Spring Boot's managed
dependencies and plugins, sets Java/Lombok/springdoc versions, and manages the
shared dependency. Every module inherits it. Applications declare their own
dependencies and enable Boot packaging; shared is an ordinary JAR.

From services, mvn -pl identity -am package builds shared and identity together.
There is no public registry or local install step for reactor builds.
[Maven reactor guide](https://maven.apache.org/guides/mini/guide-multiple-modules.html)

## Current shared code

- BearerTokenVerifier is a pure Java class with an explicit expected-token
  constructor and a boolean result. It rejects blank configuration at startup
  and compares token bytes with MessageDigest.isEqual.
- ApiExceptionHandler provides the common HTTP problem responses and error IDs.
- ClockConfiguration supplies the UTC clock.
- OpenApiConfiguration supplies the common bearer scheme and header presentation.

Each app explicitly imports the shared Spring classes in SharedConfiguration.
Its own configuration constructs the verifier, and its own authorization service
converts rejection to HTTP 401. No component scan across sibling applications or
automatic starter is involved.

Normalization remains in identity because the other apps do not currently share
its account/email/permission semantics. Entities, repositories, request/response
types, password policy and messaging's state machine remain service-owned.

## Development and distribution

Build through services/pom.xml to always use the current shared source.
For a standalone module build that cannot use the reactor, first run
mvn -pl shared -am install from services to install both the parent POM and
shared JAR locally; repeat after changes. Prefer the reactor for normal work.

Docker builds use services as their context, copy module POMs plus shared and
selected application sources, and build with -pl and -am. No developer Maven
cache is required.

GitHub Packages can be added if independently released repositories need this
library later. It adds publication, credentials and version coordination, which
the current same-repository build does not need.