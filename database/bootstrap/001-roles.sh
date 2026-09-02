#!/bin/sh
set -eu

psql --set=ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set=zelglihof_password="$ZELGLIHOF_DATABASE_PASSWORD" \
  --set=studio_password="$STUDIO_DATABASE_PASSWORD" \
  --set=identity_password="$IDENTITY_DATABASE_PASSWORD" \
  --set=messaging_password="$MESSAGING_DATABASE_PASSWORD" <<'SQL'
CREATE ROLE zelglihof_web LOGIN PASSWORD :'zelglihof_password';
CREATE ROLE studio_web LOGIN PASSWORD :'studio_password';
CREATE ROLE identity_service LOGIN PASSWORD :'identity_password';
CREATE ROLE messaging_service LOGIN PASSWORD :'messaging_password';
SQL
