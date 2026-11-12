# Base images are pinned as tag@digest across web/sites/* and services/*;
# bump the tag and the digest together.
FROM maven:3.10.0-eclipse-temurin-25-alpine@sha256:908342738213796918a85cffc2065924ba82e4a9ab87d2756073e01da6b05d78 AS build
WORKDIR /workspace
COPY services/pom.xml .
# Checkstyle runs in the validate phase, so the build image needs the shared
# configuration at the multi-module root (${maven.multiModuleProjectDirectory}).
COPY services/checkstyle.xml .
COPY services/shared/pom.xml shared/pom.xml
COPY services/identity/pom.xml identity/pom.xml
COPY services/messaging/pom.xml messaging/pom.xml
COPY services/assets/pom.xml assets/pom.xml
COPY services/shared/src shared/src
COPY services/messaging/src messaging/src
RUN mvn -q -pl messaging -am -DskipTests package

FROM eclipse-temurin:25-jre-alpine@sha256:e1898fd6a11fc965a994d8ace186fd3585aeb636cf8f05f47a723fcfee0b0918
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /workspace/messaging/target/messaging.jar /app/app.jar
USER app
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
