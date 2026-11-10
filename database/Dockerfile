# Flyway with the migrations baked in, so production does not need a repo
# checkout. Built by .github/workflows/publish.yml as
# ghcr.io/oliumbi/apps-migrate:<tag> -- the tag guarantees the migrations
# match the application images deployed with it.
# Pin tag and digest together (DR-14).
FROM flyway/flyway:13.12.1-alpine@sha256:6af6ece9c5d46f62db7409dc19992d34886cd6376ddd81dbff23d5e03708cff9

COPY database/migrations /flyway/sql
