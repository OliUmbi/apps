# Flyway with the migrations baked in, so production does not need a repo
# checkout. Built by .github/workflows/publish.yml as
# ghcr.io/oliumbi/apps-migrate:<tag> -- the tag guarantees the migrations
# match the application images deployed with it.
# Pin tag and digest together (DR-14).
FROM flyway/flyway:13.4.0-alpine@sha256:66c0278f4398dd46b84d4108919a015b6ca03657a3d44ff2b349ad0602ace956

COPY database/migrations /flyway/sql
