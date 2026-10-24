# ansible

The ops interface: everything that happens on or to the server goes through
these playbooks, run from the workstation over WireGuard. Context:
[documentation/operations.md](../documentation/operations.md).

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

- **Roles are concerns**: `server` (base system, docker, wireguard), `app`
  (compose stacks + `.env`), `dyndns`, `backup`, `housekeep`.
- **Playbooks are actions**: `site` (everything), `deploy`, `backup`,
  `housekeep`, `status`, `logs`.
- **Server-side naming is `apps-<concern>`**: scripts in
  `/usr/local/sbin/apps-<concern>.sh`, units `apps-<concern>.service/.timer`,
  config `/etc/default/apps-<concern>`. The repo copies in `files/` drop the
  `apps-` prefix and gain it on install.
- **Recurring work runs as systemd timers on the server**, never scheduled
  from the workstation. Ansible installs and triggers; it does not cron.

## quick reference

```sh
ansible-playbook playbooks/site.yml                          # full setup
ansible-playbook playbooks/deploy.yml -e image_tag=<tag>     # deploy/rollback
ansible-playbook playbooks/status.yml                        # what is going on
ansible-playbook playbooks/logs.yml -e service=<name>        # read logs
ansible-playbook playbooks/backup.yml                        # backup now
ansible-playbook playbooks/housekeep.yml                     # housekeeping now
```

Secrets: `ansible-vault create group_vars/vault.yml` (start from the
example). Nothing secret is ever committed.
