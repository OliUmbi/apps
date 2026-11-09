# Access and security

The host is managed from the workstation over WireGuard with Ansible. There is no
reason to log into the machine, and SSH is never public.

## Access model

| Item | Value |
| --- | --- |
| Host access | `deploy` user over WireGuard, sudo for Ansible |
| SSH | public only until `restrict_ssh: true`; then tunnel only |
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

> **Parallel-host safeguard:** the current `site.yml` enables dyndns for live
> production names. Complete RV-03 in [open work](../work/open-work.md) before
> running it on a parallel host, and keep router forwarding/live DNS on legacy
> until the rehearsed cutover. Otherwise the new host can redirect production
> traffic before it is ready.

1. **Workstation prep.** Ansible installed, `age-keygen` for the backup key,
   `wg genkey` for both WireGuard keys, an Infomaniak API token with
   `domain:read`, `dns:read` and `dns:write`.
2. **Router.** Reserve a LAN IP for the server. Forward **TCP 80 + 443** and
   **UDP 51820** (WireGuard), nothing else. Without the UDP forward the VPN only
   works inside the LAN.
3. **Server.** Install Debian stable, create the `deploy` user with your SSH key
   and sudo. First login is over the LAN.
4. **DNS.** Create the A records listed in `dyndns_records`
   (`ansible/group_vars/all.yml`) once in the Infomaniak manager. The timer keeps
   their values current. `vpn.oliumbi.ch` is the laptop's WireGuard endpoint.
5. **Vault.** Fill `ansible/group_vars/vault.yml` from the example.
6. **Run** `ansible-playbook playbooks/site.yml`. It installs podman, WireGuard
   and the timers, renders the units, and starts the stack from ghcr. Publish a
   version tag first so the images exist.
7. **Verify.** `status.yml`, `logs.yml`, a `backup.yml` run pulled with
   `pull-backups.ps1`, Grafana over the tunnel, issued certificates, and
   `apps-dyndns.timer` logs showing current records.
8. **Lock down** (`restrict_ssh: true`) only after WireGuard works from the
   laptop both over the LAN and from outside.

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

## Security baseline

- HTTP-only, same-site session cookies; `Secure` and `__Host-` over HTTPS.
- CSRF protection on state-changing requests.
- Authorization enforced server-side per site and capability.
- Public forms validated and honeypot-protected. Proxy rate limiting is still a
  gap ([TD-01](../work/tech-debt.md#td-01)).
- Output escaped by default; rich content sanitized narrowly.
- Uploads validated by bytes and dimensions and stored away from executable
  paths.
- Secrets only in the vault; logs redacted (no passwords, tokens, message bodies
  or personal form data).
- Security headers at the proxy; a per-site Content-Security-Policy is still
  missing ([TD-02](../work/tech-debt.md#td-02)).
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

- WireGuard and SSH lockdown are not yet verified on the rebuilt server
  ([open work](../work/open-work.md)).
- Restore drill on the not-yet-live replacement host before cutover
  ([open work](../work/open-work.md)).
- External uptime and dead-man's-switch monitoring ([open work](../work/open-work.md)).
- Legacy exposure check: confirm 5432/8080/8000 are not reachable from the
  internet ([open work](../work/open-work.md)).
