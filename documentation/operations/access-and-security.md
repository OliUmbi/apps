# Access and security

The host is managed from the workstation over WireGuard with Ansible. There is no
reason to log into the machine, and SSH is not public once the tunnel has been
proven.

## Access model

| Item | Value |
| --- | --- |
| Host access | `deploy` user over WireGuard, sudo for Ansible |
| SSH | public only until `restrict_ssh: true`; then tunnel only, and the drop-in is removed again when it is false |
| Recovery | physical access to the machine (screen/keyboard); no provider console needed |
| Admin UIs | Grafana `:3000`, Prometheus `:9090`, Alertmanager `:9093`, bound to the WireGuard address |
| Secrets | `ansible/group_vars/vault.yml` (Ansible vault) |
| Rendered secrets | `/etc/default/apps-<service>`, root-owned `0600` |
| Backup archives | `age`-encrypted; pulled to the workstation; server has no credentials for it |

The router forwards only TCP 80/443 and UDP 51820. There is no host firewall on
purpose: published container ports bypass it anyway, so what a unit publishes and
which address it binds is the exposure decision. Keep admin interfaces on the
WireGuard address.

## Provisioning from zero

For a clean machine; the legacy box stays untouched until cutover.

> **Parallel-host safeguard:** pre-cutover is now the safe default.
> `dyndns_enabled` is false, so `site.yml` installs the timer but leaves it
> stopped and a parallel clean host cannot update live DNS (RV-03). Keep router
> forwarding and live records on legacy until the final import and smoke tests;
> enable live updates only in the cutover run with
> `-e dyndns_enabled=true`.

1. **Workstation prep.** Ansible installed, `age-keygen` for the backup key,
   `wg genkey` for both WireGuard keys, an Infomaniak API token with
   `domain:read`, `dns:read` and `dns:write`.
2. **Router.** Reserve a LAN IP for the server. Forward **TCP 80 + 443** and
   **UDP 51820** (WireGuard), nothing else. Without the UDP forward the VPN only
   works inside the LAN.
3. **Server.** Install Debian stable, create the `deploy` user with your SSH key
   and sudo. First login is over the LAN. `sudo` is installed by the server role,
   so a minimal Debian image no longer breaks `become_method = sudo`.
4. **DNS.** Create the A records listed in `dyndns_records`
   (`ansible/group_vars/all.yml`) once in the Infomaniak manager, including
   `studio.*`, `admin.*` and `vpn.oliumbi.ch` for the laptop's WireGuard
   endpoint. The timer keeps their values current only when it is enabled.
5. **Vault.** Fill `ansible/group_vars/vault.yml` from the example, including
   `vault_acme_email`, `vault_infomaniak_api_token`, the per-role database
   passwords and `vault_first_admin_*`.
6. **Run** `ansible-playbook playbooks/site.yml -e image_tag=<tag>`. `latest` is
   rejected. The play installs podman, WireGuard and the timers, renders the
   units, starts postgres and the one-shot migrate unit, provisions each
   application role from the vault, checks that it can log in, and starts the
   stack from ghcr. Publish a version tag first so the images exist.
7. **First administrator.** After the stack is healthy, run
   `ansible-playbook playbooks/first-admin.yml --ask-vault-pass` once. The first
   admin is created through identity's authenticated endpoint, not by a
   migration seed.
8. **Verify.** `status.yml`, `logs.yml`, a `backup.yml` run pulled with
   `pull-backups.ps1`, Grafana over the tunnel, issued certificates, secure
   Studio cookies (`__Host-studio_session`), the CSP header, a 429 on the public
   rate limit, and `apps-dyndns.timer` **stopped** before cutover.
9. **Lock down** (`restrict_ssh: true`) only after WireGuard works from the
   laptop both over the LAN and from outside. Setting it back to `false` removes
   the drop-in again.

## Secrets

- The vault is the only source of production secrets. Templates in
  `ansible/roles/app/templates/` render per-service environment files; the units
  never contain a secret.
- Development secrets live in the gitignored root `.env`, copied from
  `infrastructure/.env.dev`. Never reuse them in a deployed environment.
- The owner confirmed in 2026-11 that the committed legacy `.env` contained only
  placeholders and that those values were already handled; no legacy rotation
  task remains. Never reuse placeholder or development values in production.
- A real credential that ever entered git is compromised, even after deletion.

### Rotating a secret

1. Add or update the key in the vault.
2. Update the service template or unit wiring if the variable is new.
3. Deploy the current tag (no image change is needed for an env-only change).
4. Verify the service starts and its health check passes.
5. Revoke the old credential at the provider or database as soon as the new one
   is confirmed working.
6. Record the rotation date in the vault entry or the operations log.

## DNS

One Infomaniak API token does all DNS work. Caddy solves ACME DNS-01 for wildcard
certificates; `ansible/files/dyndns.sh` runs every 15 minutes and updates only
the existing records listed in `dyndns_records`. It never creates or deletes
records. New names must be created once in the Infomaniak manager and added to
the list.

The timer is installed but **stopped and disabled** by default
(`dyndns_enabled: false`), so a parallel host cannot change live DNS before
cutover (RV-03). The cutover run enables it explicitly with
`-e dyndns_enabled=true`; verify the first run updates the expected records.
Caddy's ACME state is not backed up; a rebuilt host re-issues with the vault
token and ACME email ([backup and restore](backup-restore.md#caddy-acme-state-and-re-issuance)).

## Security baseline

- Session cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` with the
  `__Host-` prefix in production (`STUDIO_SECURE_COOKIES=true`). There is no
  separate CSRF token: `SameSite=Lax` plus server-side actor checks is the
  accepted model for fewer than ten Studio users; the residual risk is recorded
  in the [O-006 threat model](../reference/decisions.md#o-006-threat-model-accepted-2026-11).
- Authorization enforced server-side per site and capability.
- Public forms validated and honeypot-protected; Caddy rate-limits public
  traffic (20 events/2s per IP, IPv6 /64) and login (10/min). A 429 is the only
  edge-visible refusal.
- A baseline Content-Security-Policy is sent from Caddy with the shared headers;
  script/style inline code is still allowed, so treat it as a baseline rather
  than a nonce-based strict policy.
- Output escaped by default; rich content sanitized narrowly.
- Uploads validated by bytes and dimensions and stored away from executable
  paths.
- Secrets only in the vault; logs redacted (no passwords, tokens, message bodies
  or personal form data). Secret-rendering tasks use `no_log`.
- Certificates are re-issued through DNS-01 on a rebuilt host; the vault token
  and ACME email are the recovery inputs, and `CertificateExpiringSoon` warns
  before expiry.
- Dependencies and base images are pinned; automated security updates run on the
  host, and a full upgrade is part of the quarterly drill.
- Before launch, document for every form what is collected, its purpose,
  recipient, retention and deletion. Swiss requirements are reviewed with a
  qualified person.

## Access review

When an editor leaves or changes role:

1. Disable the identity account (sessions are revoked).
2. Remove site permissions that are no longer needed.
3. Confirm no shared credentials existed for that person.
4. If a deploy key or token was exposed, rotate it and check the audit trail.

## Known gaps

- WireGuard and SSH lockdown are code complete and reversible; both still need
  verification on the rebuilt server ([open work](../work/open-work.md)).
- Restore drill on the not-yet-live replacement host before cutover, including
  database/media and Caddy certificate re-issuance
  ([open work](../work/open-work.md)).
- External uptime and dead-man's-switch monitoring ([open work](../work/open-work.md)).
- Legacy exposure check: confirm 5432/8080/8000 are not reachable from the
  internet ([open work](../work/open-work.md)).
- Real-host role provisioning, monitoring config readability, DNS resolution and
  SMTP deliverability are verified only when the deploy runs on the server.
