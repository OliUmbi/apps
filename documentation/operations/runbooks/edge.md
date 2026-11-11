# Edge, domains and certificates

**When:** adding or changing a public name, re-issuing certificates, or changing
Caddy routing, rate limits, body limits or security headers. The edge subsystem
is [edge](../../architecture/subsystems/edge.md); the Caddyfile is in
`infrastructure/caddy/Caddyfile` and is baked into the caddy image.

## Add or change a domain

1. Create the DNS record once in the Infomaniak manager and add the name to
   `dyndns_records` in `ansible/group_vars/all.yml`. The timer only updates
   existing records; it never creates or deletes them.
2. Add the route or redirect to `infrastructure/caddy/Caddyfile`.
3. Commit, publish a version tag (the Caddyfile ships in the image) and
   [deploy](release.md).
4. Verify DNS, certificate issuance, redirects and the site. Keep the old name
   working until the change is accepted.
5. The retired `api.*` names are not redirected; delete their records at
   cutover.

## Certificate re-issuance

Caddy's ACME state is deliberately outside the backup (D21/TD-16). A rebuilt host
re-issues through DNS-01; never copy or delete the certificate store on a running
host.

Inputs from the vault, rendered into `/etc/default/apps-caddy`:

- `vault_acme_email` (`ACME_EMAIL`);
- `vault_infomaniak_api_token` (`INFOMANIAK_API_TOKEN`, scopes `domain:read`,
  `dns:read`, `dns:write`).

1. Confirm both values are present and readable by the caddy unit.
2. Start `apps-caddy` and watch the ACME/DNS-01 log:
   `ansible-playbook playbooks/logs.yml -e service=caddy`.
3. Confirm issuance with an HTTPS probe and
   `probe_ssl_earliest_cert_expiry` / `CertificateExpiringSoon`.
4. Respect Let's Encrypt rate limits: do not restart or recreate the container
   while issuance is in flight. Repeated failures are a DNS or token problem,
   not a reason to retry faster.
5. Record the re-issuance in the restore or deploy notes.

## Change Caddy behaviour

Rate limits, the CSP, body limits and caching live in the Caddyfile:

1. Make the smallest change; keep the shared snippets (`common`, `ratelimit`,
   `public-body`, `studio-body`, `errors`).
2. The image build checks that the plugins register, not the Caddyfile grammar.
   Caddy validates the file at startup, so deploy and watch the caddy unit before
   switching public traffic; a syntax error leaves Caddy down.
3. Publish a tag and deploy; the Caddyfile is not mounted from the host.
4. Run the [edge checks](security.md#edge-checks): headers, CSP, 429, login
   limit and body limits.
5. If a new embed or external origin is needed, widen the CSP deliberately and
   record why.

## Never do this

- Do not delete `/var/lib/apps/caddy-data` to "refresh" a certificate; it holds
  the ACME account and current certificates.
- Do not point public DNS or router forwarding at a parallel host before the
  cutover run.
- Do not edit the Caddyfile on the server; it comes from the pinned image.

## Done when

- DNS resolves, the certificate is valid, and the site or redirect works.
- The edge checks pass and no embed is blocked.
- The change is recorded in the release log; any follow-up is in the registers.
