# Base images are pinned as tag@digest across web/sites/* and services/*;
# bump the tag and the digest together.
FROM maven:3.9.12-eclipse-temurin-25-alpine@sha256:91fbbf32cc5076b6142ed98405f3a1a21e102d876eafa5eaf359b5591e8e3fd8 AS build
WORKDIR /workspace
COPY pom.xml .
COPY shared/pom.xml shared/pom.xml
COPY identity/pom.xml identity/pom.xml
COPY messaging/pom.xml messaging/pom.xml
COPY assets/pom.xml assets/pom.xml
COPY shared/src shared/src
COPY messaging/src messaging/src
RUN mvn -q -pl messaging -am -DskipTests package

FROM eclipse-temurin:25-jre-alpine@sha256:b7528962e65d43064d8a8b67ba175367896bc948363ea2d3fcd7f10d34e1f048
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /workspace/messaging/target/messaging.jar /app/app.jar
USER app
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
