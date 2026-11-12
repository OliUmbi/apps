# Backup

**When:** the nightly timer runs automatically; run this manually before a risky
change, before a drill, or after a host rebuild. The policy and contents are in
[backup and restore](../backup-restore.md).

## Run and verify a backup

From `ansible/`:

```sh
ansible-playbook playbooks/backup.yml
ansible-playbook playbooks/logs.yml -e service=backup
```

Confirm:

- a new `/var/backups/apps/apps-<UTC-stamp>.tar.gz.age` exists and the previous
  copies are still there (three are kept);
- `apps_backup_last_success_timestamp_seconds` is recent and
  `apps_backup_size_bytes` is not zero;
- the journal ends with a successful run, not a skipped stage.

A run is only successful when the metric is written. The script writes the
textfile atomically after every stage, so a failed stage leaves no new success
metric and `BackupStale` keeps firing (RV-02).

## Pull to the workstation

The server has no credentials for the workstation; pull over WireGuard.

```powershell
# Windows
.\ansible\files\pull-backups.ps1
```

```sh
# WSL / Git Bash
./ansible/files/pull-backups.sh
```

Both keep seven local copies and warn when the newest is more than a day old.
Install the Windows pull as a daily scheduled task from an elevated PowerShell,
so the off-host copy does not depend on remembering it:

```powershell
$script = Join-Path $PWD "ansible\files\pull-backups.ps1"
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$script`""
$trigger = New-ScheduledTaskTrigger -Daily -At 08:00
Register-ScheduledTask -TaskName "OliUmbi backup pull" `
  -Action $action -Trigger $trigger
```

Run it manually after a deploy and before any risky change. A pulled archive
still proves nothing until [restore](restore.md) succeeds once.

## Key handling (once, then treat it as done)

The server only holds the **public** `age` recipient in the vault
(`vault_age_recipient`). The private identity is passphrase-wrapped, kept in the
password manager and printed on one recovery sheet. `age` prompts for the
passphrase when the wrapped identity is passed with `-i`.

On the workstation:

```sh
age-keygen -o backup-identity.txt                       # prints the public age1... key
age -p -a -o backup-identity.age backup-identity.txt    # set the passphrase
rm backup-identity.txt                                  # no plaintext key remains
```

1. Put the printed public key in the vault as `vault_age_recipient`.
2. Put `backup-identity.age` (ASCII-armored) in the password manager.
3. Print the armored block, the passphrase and the two restore commands on the
   recovery sheet. Store it where a second person can find it if the maintainer
   is unavailable.
4. Test the **printed sheet**, not the password-manager copy, in the restore
   drill.

Losing the identity loses every archive. Losing only the workstation is
recoverable from the sheet.

### Replace the key

Generate a new identity, update `vault_age_recipient`, take a fresh archive, and
keep the old sheet until the old archives are outside the retention window. A new
key cannot decrypt old archives.

## If it fails

| Symptom | Do |
| --- | --- |
| `BackupStale` fired | Check `status.yml`, the timer, disk space and the backup journal; run `backup.yml` manually |
| No new archive | Read the failing stage; fix it and rerun. Do not write the success metric by hand |
| Pull failed | Verify WireGuard, the server directory and permissions; a failed pull never deletes local copies |
| Archive corrupt | Use the previous copy and investigate disk/encryption before trusting the next run |

## Done when

- The run is green, the metric is recent, and a copy exists on the workstation.
- The [restore drill](restore.md#drill-acceptance) has been done with the printed
  identity, or the open-work item still records why it has not.
