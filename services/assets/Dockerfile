FROM maven:3.9.12-eclipse-temurin-25-alpine AS build
WORKDIR /workspace
COPY pom.xml .
COPY shared/pom.xml shared/pom.xml
COPY identity/pom.xml identity/pom.xml
COPY messaging/pom.xml messaging/pom.xml
COPY assets/pom.xml assets/pom.xml
COPY shared/src shared/src
COPY assets/src assets/src
RUN mvn -q -pl assets -am -DskipTests package

FROM eclipse-temurin:25-jre-alpine
RUN addgroup -S app && adduser -S app -G app
RUN mkdir -p /media && chown app:app /media
USER app
COPY --from=build /workspace/assets/target/assets-0.1.0.jar /app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
