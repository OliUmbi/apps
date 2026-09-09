# Shared Java library options

This is a proposal; the build layout has not been changed in this pass.

## Recommended: a module in this repository

Add a small `java-common` JAR and a root aggregator POM listing it alongside identity, messaging
and assets. The existing Spring Boot parent relationship can stay initially: aggregation does not
require immediately replacing each module's parent POM.

Each consumer adds an ordinary dependency on `ch.oliumbi:java-common:0.1.0-SNAPSHOT`.
The reactor sorts modules by their dependencies. Building from the root with
`mvn -pl identity -am package` builds the shared module and identity together; no publication or
separate local install is needed for that build. This is the simplest fit for the existing monorepo.
[Maven multi-module guide](https://maven.apache.org/guides/mini/guide-multiple-modules.html)

Example proposed layout:

```text
pom.xml                 # aggregator, packaging=pom
java-common/pom.xml     # ordinary JAR, not a Boot executable
identity/pom.xml
messaging/pom.xml
assets/pom.xml
```

Docker build contexts must move from the individual service directory to the repository root.
Copy the aggregator/module POMs and required shared/service sources, then use the same reactor
build inside Docker. A developer's local Maven cache must not be required for CI or containers.
Keep unrelated web sources out of Docker's context with an appropriate ignore file.

## Local install: useful for standalone builds

`mvn -f java-common/pom.xml install` puts the JAR and POM into the local Maven repository,
normally `~/.m2/repository`. Consumers can then build independently using their normal dependency.
No public repository is needed. The tradeoff is remembering to reinstall after shared-code changes;
each developer, CI job and Docker build needs the shared artifact built or provided.
[Maven repositories](https://maven.apache.org/guides/introduction/introduction-to-repositories.html)

This is a convenience alongside the reactor, rather than a reason to split repositories.
If the library later moves to its own Git repository, CI can simply check it out and run install
before building the consumer. Pin the library revision so builds remain reproducible.

## GitHub Packages: later, if independent distribution becomes useful

A Maven JAR can be published to GitHub Packages and consumed as a versioned dependency.
This adds repository configuration, credentials and release/version management. Developer access
uses a supported personal access token; GitHub Actions can use `GITHUB_TOKEN` where the package
permissions allow it. It is useful across independently released repositories, but unnecessary
overhead for the current layout.
[GitHub Maven registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-apache-maven-registry)

## What to share first

Start with one small module:

- A pure bearer-token verifier taking its expected token through a constructor. Let each service
  supply configuration and decide how invalid authorization becomes an HTTP response.
- The common problem-response/error-correlation handling, imported explicitly by each app.
- Optional common clock/OpenAPI configuration, if keeping it consistent saves actual duplication.
- Small normalization primitives only when semantics really match. Account/email/permission policy
  should remain owned by identity rather than becoming an implicit rule for every service.

Use explicit beans or imports, not automatic scanning of an unrelated package.
Do not share entities, repositories, service DTOs, password policy or messaging's state machine.
Spring already supplies paging and sorting; a new pagination abstraction would add little.

Avoid a custom Boot starter and multiple common modules initially. Introduce them only when
real consumers need separate dependency boundaries.
