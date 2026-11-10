#!/bin/sh
set -eu

# One-time first-administrator bootstrap. Executed inside a pinned
# curlimages/curl container on the app network by playbooks/first-admin.yml.
# The playbook passes the account and permission bodies as JSON, so this script
# does not have to quote the operator's values.

: "${IDENTITY_URL:?}"
: "${IDENTITY_TOKEN:?}"
: "${ADMIN_ACCOUNT_JSON:?}"
: "${ADMIN_PERMISSION_JSON:?}"

auth="Authorization: Bearer ${IDENTITY_TOKEN}"

echo "first-admin: creating account"
response=$(curl -fsS -X POST \
  -H "$auth" \
  -H "Content-Type: application/json" \
  --data "$ADMIN_ACCOUNT_JSON" \
  "$IDENTITY_URL/account")

account_id=$(printf '%s' "$response" |
  sed -n 's/.*"id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
if [ -z "$account_id" ]; then
  echo "first-admin: could not read the account id from the response" >&2
  exit 1
fi

echo "first-admin: granting studio.admin"
curl -fsS -X PUT \
  -H "$auth" \
  -H "Content-Type: application/json" \
  --data "$ADMIN_PERMISSION_JSON" \
  "$IDENTITY_URL/account/$account_id/permission"

echo "first-admin: done ($account_id)"
