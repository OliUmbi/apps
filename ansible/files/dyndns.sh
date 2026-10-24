#!/bin/sh
set -eu

# Keeps the managed A records pointing at this server's public IP, using the
# Infomaniak DNS API. Uses the same API token as caddy's ACME DNS-01 (scopes:
# domain:read, dns:read, dns:write) -- one credential for all DNS work.
#
# Only existing A records listed in INFOMANIAK_RECORDS are ever touched; the
# records must be created once in the Infomaniak manager. Config comes from
# /etc/default/apps-dyndns (written by ansible).

[ -f /etc/default/apps-dyndns ] && . /etc/default/apps-dyndns

: "${INFOMANIAK_API_TOKEN:?set INFOMANIAK_API_TOKEN}"
: "${INFOMANIAK_RECORDS:?set INFOMANIAK_RECORDS (space separated fqdns)}"

API=https://api.infomaniak.com

api() {
  curl -fsS --max-time 20 -H "Authorization: Bearer ${INFOMANIAK_API_TOKEN}" "$@"
}

IP=$(curl -fsS --max-time 15 https://api.ipify.org) || {
  echo "dyndns: cannot determine public ip" >&2
  exit 1
}

for fqdn in ${INFOMANIAK_RECORDS}; do
  # registered domain = last two labels (oliumbi.ch, jublawoma.ch, ...)
  domain=$(echo "$fqdn" | sed 's/.*\.\([^.]*\.[^.]*\)$/\1/')
  name=${fqdn%.$domain}
  [ "$name" = "$fqdn" ] && name="@"

  zone=$(api "$API/2/domains/$domain/zones" | jq -r '.data[0].fqdn')
  if [ -z "$zone" ] || [ "$zone" = "null" ]; then
    echo "dyndns: no zone found for $domain" >&2
    exit 1
  fi

  records=$(api "$API/2/zones/$zone/records?with=records_description" |
    jq -c --arg fqdn "$fqdn" --arg name "$name" --arg zone "$zone" '
      (.data // [])[] | select(.type == "A")
      | select((.source | gsub("\\.$"; "")) as $s
          | $s == $fqdn or $s == $name or ($s == $zone and $name == "@"))
    ')

  if [ -z "$records" ]; then
    echo "dyndns: $fqdn: no A record found -- create it once in the manager" >&2
    continue
  fi

  echo "$records" | while IFS= read -r record; do
    id=$(echo "$record" | jq -r .id)
    target=$(echo "$record" | jq -r .target)
    if [ "$target" = "$IP" ]; then
      echo "dyndns: $fqdn: $IP (unchanged)"
    else
      api -X PUT -H "Content-Type: application/json" \
        -d "$(echo "$record" | jq -c --arg ip "$IP" '.target = $ip')" \
        "$API/2/zones/$zone/records/$id?with=records_description" > /dev/null
      echo "dyndns: $fqdn: $target -> $IP"
    fi
  done
done
