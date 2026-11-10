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
COPY services/assets/src assets/src
RUN mvn -q -pl assets -am -DskipTests package

FROM eclipse-temurin:25-jre-alpine@sha256:e1898fd6a11fc965a994d8ace186fd3585aeb636cf8f05f47a723fcfee0b0918
WORKDIR /app
# uid/gid pinned: /media is a host bind mount on the server (ansible chowns
# /var/lib/apps/media to 100:100). Alpine already owns GID 100 as `users`, so
# create the app user with that group instead of adding a conflicting group.
RUN adduser -S -u 100 -G users app
RUN mkdir -p /media && chown app:users /media
COPY --from=build /workspace/assets/target/assets.jar /app/app.jar
USER app
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
