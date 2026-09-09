FROM maven:3.9.12-eclipse-temurin-25-alpine AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:25-jre-alpine
RUN addgroup -S app && adduser -S app -G app
USER app
COPY --from=build /workspace/target/identity-0.1.0.jar /app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
