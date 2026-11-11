# ansible

The ops interface: everything that happens on or to the server goes through
these playbooks, run from the workstation over WireGuard. Context:
[documentation/operations/README.md](../documentation/operations/README.md).

## layout

| path | purpose |
| --- | --- |
| `inventory.yml` | the one server (WireGuard address) |
| `group_vars/all.yml` | non-secret configuration |
| `group_vars/vault.yml.example` | every secret key, template for the vault |
| `playbooks/` | one action per playbook |
| `roles/` | one concern per role |
| `files/` | scripts, systemd units and workstation helpers |

## patterns

- **Roles are concerns**: `server` (base system, podman, wireguard), `app`
  (systemd units + environment files), `dyndns`, `backup`, `housekeep`.
- **Playbooks are actions**: `site` (everything), `deploy`, `first-admin`,
  `backup`, `housekeep`, `status`, `logs`.
- **Server-side naming is `apps-<concern>`**: scripts in
  `/usr/local/sbin/apps-<concern>.sh`, units `apps-<concern>.service/.timer`,
  config `/etc/default/apps-<concern>`. The repo copies in `files/` drop the
  `apps-` prefix and gain it on install.
- **Recurring work runs as systemd timers on the server**, never scheduled
  from the workstation. Ansible installs and triggers; it does not cron.

## quick reference

```sh
ansible-playbook playbooks/site.yml -e image_tag=<tag>       # full setup
ansible-playbook playbooks/deploy.yml -e image_tag=<tag>     # deploy/rollback
ansible-playbook playbooks/first-admin.yml                    # one-time first Studio admin
ansible-playbook playbooks/status.yml                        # what is going on
ansible-playbook playbooks/logs.yml -e service=<name>        # read logs
ansible-playbook playbooks/backup.yml                        # backup now
ansible-playbook playbooks/housekeep.yml                     # housekeeping now
```

`image_tag` has no default and `latest` is rejected: pass the release tag
explicitly. `first-admin.yml` uses the vault's `vault_first_admin_*` values and
must not be replaced by seeding an account in migrations.

The `app` role starts postgres and `apps-migrate`, provisions the content roles,
the `oliumbi` counter role and the read-only `monitoring` role from the vault,
verifies one login per role, and only then starts the application units. Oliumbi
writes only the shared analytics counter; its content schema has no tables. The backup
and housekeeping timers are templated from `backup_hour`, `housekeep_day` and
`housekeep_hour`. The dyndns timer is installed but disabled before cutover
(`dyndns_enabled: false`); enable it explicitly on the cutover run and keep
passing `-e dyndns_enabled=true` to every later `site.yml` run, or it stops live
DNS updates.

Secrets: `ansible-vault create group_vars/vault.yml` (start from the
example). Nothing secret is ever committed.
