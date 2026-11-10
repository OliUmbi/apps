# Base images are pinned as tag@digest across web/sites/* and services/*;
# bump the tag and the digest together.
FROM maven:3.9.12-eclipse-temurin-25-alpine@sha256:91fbbf32cc5076b6142ed98405f3a1a21e102d876eafa5eaf359b5591e8e3fd8 AS build
WORKDIR /workspace
COPY services/pom.xml .
COPY services/shared/pom.xml shared/pom.xml
COPY services/identity/pom.xml identity/pom.xml
COPY services/messaging/pom.xml messaging/pom.xml
COPY services/assets/pom.xml assets/pom.xml
COPY services/shared/src shared/src
COPY services/identity/src identity/src
RUN mvn -q -pl identity -am -DskipTests package

FROM eclipse-temurin:25-jre-alpine@sha256:e1898fd6a11fc965a994d8ace186fd3585aeb636cf8f05f47a723fcfee0b0918
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /workspace/identity/target/identity.jar /app/app.jar
USER app
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
