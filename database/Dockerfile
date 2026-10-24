# Flyway with the migrations baked in, so production does not need a repo
# checkout. Built by .github/workflows/publish.yml as
# ghcr.io/oliumbi/apps-migrate:<tag> -- the tag guarantees the migrations
# match the application images deployed with it.
FROM flyway/flyway:13.4.0-alpine

COPY ./migrations /flyway/sql
