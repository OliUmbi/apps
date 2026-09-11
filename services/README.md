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
The shared startup loader discovers the repository root and reads `.env.development`
automatically, whether the working directory is the repository, reactor, or a service.
Create it once from `.env.development.example`. No IntelliJ env-file link is needed.
Shell/IDE variables, JVM properties and command-line settings take precedence.
Remove old `APP_ENV_FILE` overrides to use discovery; an explicit `APP_ENV_FILE`
still selects an alternate file (and fails if unreadable). Outside a checkout,
services use externally supplied configuration. Use unquoted `KEY=value` entries,
no interpolation, and forward slashes for paths in the shared file.

Import services/pom.xml as the Maven project in IntelliJ so all modules are linked.
Permanent tests remain deferred.

## Containers

Run docker compose build identity messaging from the repository root.
Both Dockerfiles use services as their build context and build the selected
application plus shared through the reactor. They do not depend on locally
installed shared artifacts. Generated target directories are excluded.

## Sharing code

See [shared library](../documentation/java-shared-library.md) for the boundaries
and explicit Spring wiring.