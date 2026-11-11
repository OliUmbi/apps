# Server setup

**When:** a replacement or rebuilt host must go from an empty Debian install to a
healthy stack. This is also the first-run checklist before the cutover. The
legacy host stays live until the cutover; this runbook never repoints router
forwarding or enables live DNS.

**Related:** [access model and security baseline](../access-and-security.md),
[release model](../deployment.md), [backup key](../backup-restore.md).

## Before you start

- Workstation with `git`, Ansible, `age`, `wg` and access to the repository.
- The domain manager (Infomaniak) and an API token with `domain:read`,
  `dns:read`, `dns:write`.
- Router access to reserve a LAN address and forward ports.
- The vault passphrase and every value listed in
  `ansible/group_vars/vault.yml.example`.
- A published image tag (`publish.yml` green); `latest` is rejected.

## Steps

1. **Generate the WireGuard keys on the workstation.** Keep the server private
   key and the laptop public key for the vault; the laptop keeps its private
   key.

   ```sh
   wg genkey > server.key
   wg pubkey < server.key > server.pub
   wg genkey > laptop.key
   wg pubkey < laptop.key > laptop.pub
   ```

   Create the laptop tunnel (`/etc/wireguard/wg0.conf` or the app's import
   format). The server template allocates `10.8.0.2/32` to the workstation and
   listens on `vpn.oliumbi.ch:51820`:

   ```ini
   [Interface]
   Address = 10.8.0.2/32
   PrivateKey = <laptop.key>

   [Peer]
   PublicKey = <server.pub>
   Endpoint = vpn.oliumbi.ch:51820
   AllowedIPs = 10.8.0.0/24
   PersistentKeepalive = 25
   ```

   The backup identity is generated once by the
   [backup runbook](backup.md#key-handling-once-then-treat-it-as-done); if this
   is the first host, do that before the first backup.

2. **Router.** Reserve a LAN address for the server and forward **TCP 80 and
   443** and **UDP 51820** (WireGuard). Forward nothing else. Keep both pointed
   at the legacy host until the cutover run.

3. **Server.** Install Debian stable, create the `deploy` user with your SSH key
   and sudo, and confirm the first login over the LAN. The `server` role installs
   `sudo`, podman and WireGuard; the app, dyndns, backup and housekeep roles
   install the units and timers. Password authentication is disabled from the
   first run, so verify the key works before running `site.yml`.

4. **DNS.** Create the A records listed in `dyndns_records`
   (`ansible/group_vars/all.yml`) once in the Infomaniak manager, including
   `studio.*`, `admin.*` and `vpn.oliumbi.ch`. The dyndns timer only updates
   existing records; it never creates them. Pre-cutover the timer is disabled,
   so if the public IP changes, update `vpn.oliumbi.ch` by hand before the
   tunnel breaks.

5. **Vault.** Start from the example and fill every key:

   ```sh
   cd ansible
   ansible-vault create group_vars/vault.yml   # copy the keys from vault.yml.example
   ```

   At minimum: `vault_wireguard_server_private_key`,
   `vault_wireguard_laptop_public_key`, `vault_acme_email`,
   `vault_infomaniak_api_token`, every database role password, the SMTP values,
   the site request/newsletter addresses, `vault_age_recipient`,
   `vault_first_admin_*`, `vault_ntfy_webhook_url` and
   `vault_grafana_admin_password`.

6. **Publish and run.** Bring the WireGuard tunnel up (`wg-quick up wg0`, then
   `ping 10.8.0.1`) and publish a version tag, then from `ansible/`:

   ```sh
   ansible-playbook playbooks/site.yml -e image_tag=<tag>
   ```

   `site.yml` is idempotent. It installs the base system and timers, renders the
   units, starts postgres and the one-shot migrate unit, provisions every
   application database role from the vault, verifies one login per role, and
   starts the stack. `dyndns_enabled` stays `false`, so a parallel host cannot
   change live DNS (RV-03).

7. **First administrator.** Once the stack is healthy, run once:

   ```sh
   ansible-playbook playbooks/first-admin.yml --ask-vault-pass
   ```

   It creates the account through identity's authenticated endpoint and grants
   `studio.admin`; it fails rather than duplicating an account. Never seed the
   first admin in a migration.

8. **Verify.** Run the [deploy verification](release.md#verify) plus:

   - test each public name with `curl --resolve <name>:443:<server-ip>
     https://<name>/` so public DNS can stay on legacy;
   - `apps-dyndns.timer` is **stopped and disabled**;
   - a backup run succeeds and the archive is pulled to the workstation;
   - Grafana, Prometheus and Alertmanager answer on the WireGuard address;
   - PostgreSQL, SSH and the service ports are not published publicly.

9. **Lock down SSH** only after WireGuard works from the laptop both on the LAN
   and from outside. Set `restrict_ssh: true`, rerun `site.yml`, and confirm the
   drop-in exists. Setting it back to `false` removes the drop-in again; verify
   the reversal before relying on it. Without a proven tunnel, recovery is
   physical access.

10. **Record the result.** Note the host, the image tag, the verification result
    and any deviation in the [release log](../releases.md). Close the matching
    `[verify]` items in [open work](../../work/open-work.md) with the evidence.

## Done when

- Every `apps-*` unit is active and every timer is enabled except dyndns.
- The public sites and Studio answer over the tunnel with valid certificates.
- Secure Studio cookies (`__Host-studio_session`), the CSP header and the 429
  rate limit are confirmed (see [security](security.md#edge-checks)).
- The first admin signs in; a backup exists on the server and on the workstation.
- An alert reaches the phone and the tunnel works from outside the LAN.
- Router forwarding still points at legacy (pre-cutover).

## If it fails

- Do not enable dyndns or change router forwarding to make a test pass.
- A unit that failed at first start: read `logs.yml -e service=<name>`; check the
  migrate log first, then the rendered `/etc/default/apps-*` file.
- No certificate: check the Infomaniak token, the DNS records and the caddy
  journal; the Caddyfile comes from the image.
- Everything unreachable: use physical access. The tunnel and monitoring are on
  the same host.
