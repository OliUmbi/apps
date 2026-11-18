# Test-host overlay

**Not for a deployed environment.** These files exist for a disposable feedback
host: they replace the production edge with `sslip.io` hostnames, catch all mail
in Mailpit, and remove the production DNS dependency. The production units,
Caddyfile and vault stay untouched.

## What is here

| File | Purpose |
| --- | --- |
| `Caddyfile` | Real HTTPS via `sslip.io` and Let's Encrypt HTTP-01/TLS-ALPN; one host per site. |
| `mailpit.container` | Test SMTP sink on `net-apps`; UI on `127.0.0.1:8025`. |
| `make-vault.py` | Generates a disposable vault, age identity and WireGuard keys. |

`ansible/playbooks/test-host.yml` installs the overlay after `site.yml`.

## Run order

Use the repository's normal `site.yml`, then the overlay:

```sh
cd ansible
ansible-playbook -i inventory-local.yml playbooks/site.yml \
  -e image_tag=<tag> --vault-password-file ../.vault-pass
ansible-playbook -i inventory-local.yml playbooks/test-host.yml \
  --vault-password-file ../.vault-pass
ansible-playbook -i inventory-local.yml playbooks/first-admin.yml \
  --vault-password-file ../.vault-pass
```

`inventory-local.yml` is a local-connection inventory for running Ansible on the
host itself:

```yaml
all:
  hosts:
    server:
      ansible_connection: local
      ansible_user: debian
  vars:
    ansible_python_interpreter: /usr/bin/python3
```

Re-run `test-host.yml` after every `deploy.yml`: the app role re-renders the
units from the repository and removes the test mount/URLs.

## Requirements

- Inbound **TCP 80 and 443** reachable from the internet. Caddy obtains the
  `sslip.io` certificates with HTTP-01/TLS-ALPN; without them every site stays
  on a self-signed fallback.
- The host's public IP encoded in `Caddyfile` (`86-119-66-183.sslip.io`). Change
  the file if the address changes.
- A valid-looking ACME contact address. `.invalid` is rejected by Let's Encrypt.

## URLs

- `https://jublawoma.86-119-66-183.sslip.io`
- `https://unclet.86-119-66-183.sslip.io`
- `https://zelglihof.86-119-66-183.sslip.io`
- `https://oliumbi.86-119-66-183.sslip.io`
- `https://studio.86-119-66-183.sslip.io`

Mailpit UI, over an SSH tunnel:

```sh
ssh -L 8025:127.0.0.1:8025 debian@86.119.66.183
```

## Intentional differences from production

- No Infomaniak DNS-01 and no wildcard certificates; public hostnames are the
  `sslip.io` names.
- No `www`/`studio.*` redirects; each site has one host.
- Monitoring is stopped to avoid false TLS-probe alerts against the production
  hostnames. Start it manually if needed.
- `dyndns_enabled` stays false; this host never writes public DNS.

A feedback run proves the application, data, mail and deploy workflow. It does
not prove the production domain/DNS-01 edge, real SMTP deliverability, or the
production rate-limit/header behaviour against the real hostnames.
