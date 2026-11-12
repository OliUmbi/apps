# Flyway with the migrations baked in, so production does not need a repo
# checkout. Built by .github/workflows/publish.yml as
# ghcr.io/oliumbi/apps-migrate:<tag> -- the tag guarantees the migrations
# match the application images deployed with it.
# Pin tag and digest together (DR-14).
FROM flyway/flyway:13.12.2-alpine@sha256:f5b9740a05ef38fc31356dcf2e7796dafc693ea289546e82c7699d37f83349af

COPY database/migrations /flyway/sql
