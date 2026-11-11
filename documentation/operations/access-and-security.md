# Access and security

The host is managed from the workstation over WireGuard with Ansible. There is no
reason to log into the machine, and SSH is not public once the tunnel has been
proven.

**Procedures:** [server setup](runbooks/setup.md),
[security](runbooks/security.md) and [edge](runbooks/edge.md). This page owns the
access model, the secret policy and the security baseline.

## Access model

| Item | Value |
| --- | --- |
| Host access | `deploy` user over WireGuard, sudo for Ansible |
| SSH | public only until `restrict_ssh: true`; then tunnel only, and the drop-in is removed again when it is false |
| Recovery | physical access to the machine (screen/keyboard) |
| Admin UIs | Grafana `:3000`, Prometheus `:9090`, Alertmanager `:9093`, bound to the WireGuard address |
| Secrets | `ansible/group_vars/vault.yml` (Ansible vault) |
| Rendered secrets | `/etc/default/apps-<service>`, root-owned `0600` |
| Backup archives | `age`-encrypted; pulled to the workstation; the server has no credentials for it |

The router forwards only TCP 80/443 and UDP 51820 (WireGuard). There is no host
firewall on purpose: published container ports bypass it anyway, so what a unit
publishes and which address it binds is the exposure decision. Keep admin
interfaces on the WireGuard address. The legacy exposure check is done: the old
5432/8080/8000 ports are not reachable.

## Secrets

- The vault is the only source of production secrets. Templates in
  `ansible/roles/app/templates/` render per-service environment files; the units
  never contain a secret.
- Development secrets live in the gitignored root `.env`, copied from
  `infrastructure/.env.dev`. Never reuse them in a deployed environment.
- A real credential that ever entered git is compromised, even after deletion;
  rotate it ([security](runbooks/security.md#a-leaked-credential)).
- Secret-rendering tasks run with `no_log`; logs never contain passwords, tokens,
  message bodies or personal form data.

## DNS

One Infomaniak API token does all DNS work (scopes `domain:read`, `dns:read`,
`dns:write`). Caddy solves ACME DNS-01 for wildcard certificates;
`ansible/files/dyndns.sh` runs every 15 minutes and updates only the existing
records listed in `dyndns_records`. It never creates or deletes records: new names
must be created once in the Infomaniak manager and added to the list.

The timer is installed but **stopped and disabled** by default
(`dyndns_enabled: false`), so a parallel host cannot change live DNS before
cutover (RV-03). The cutover run enables it explicitly with
`-e dyndns_enabled=true`; verify the first run updates the expected records.
Adding a domain is in the [edge runbook](runbooks/edge.md#add-or-change-a-domain).

## Security baseline

- Session cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` with the
  `__Host-` prefix in production (`STUDIO_SECURE_COOKIES=true`). There is no
  separate CSRF token: `SameSite=Lax` plus server-side actor checks is the
  accepted model for fewer than ten Studio users; the residual risk is recorded
  in the [O-006 threat model](../reference/decisions.md#o-006-threat-model-accepted-2026-11).
- Authorization is enforced server-side per site and capability.
- Public forms are validated and honeypot-protected; Caddy rate-limits public
  traffic (20 events/2s per IP, IPv6 /64) and login (10/min). A 429 is the only
  edge-visible refusal.
- A baseline Content-Security-Policy is sent from Caddy with the shared headers;
  inline script/style is still allowed, so treat it as a baseline rather than a
  nonce-based strict policy.
- Output is escaped by default; rich content is sanitized narrowly.
- Uploads are validated by bytes and dimensions and stored away from executable
  paths.
- Certificates are re-issued through DNS-01 on a rebuilt host;
  `CertificateExpiringSoon` warns before expiry.
- Dependencies and base images are pinned; automated security updates run on the
  host, and a full upgrade is part of the quarterly drill.
- Before launch, document for every form what is collected, its purpose,
  recipient, retention and deletion. Swiss requirements are reviewed with a
  qualified person.

## Procedures

- [Server setup](runbooks/setup.md) - a clean host, first admin, verification and
  SSH lockdown.
- [Security](runbooks/security.md) - scan triage, rotation, leaked credentials,
  access review, data deletion.
- [Edge](runbooks/edge.md) - domains, certificates and Caddy behaviour.

Unfinished access or security work lives in [open work](../work/open-work.md) and
[technical debt](../work/tech-debt.md), not on this page.
