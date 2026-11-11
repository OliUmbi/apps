# Restore drill record

One record per drill. Fill it in while running
[restore](../runbooks/restore.md); a drill that is not recorded did not happen.
Keep the source archive and this record together.

## Session

| Field | Value |
| --- | --- |
| Date (UTC) | |
| Operator | |
| Target host | |
| Source archive | `apps-<stamp>.tar.gz.age` |
| Archive age on drill day | |
| Image tag in `manifest.txt` | |
| Migration head expected | V012 (or current) |
| Recovery identity used | printed sheet / password manager |
| Workstation archive copy | |

## Preconditions

- [ ] The target is not serving traffic; legacy is still live.
- [ ] The archive was pulled over WireGuard, not copied from the server.
- [ ] `apps-backup.timer` is disabled on the target.
- [ ] The old data directory (if any) is kept, not deleted.
- [ ] The printed recovery sheet is the input, not the password-manager copy.

## Restore steps and observations

- [ ] Decrypt with `age -d -i backup-identity.age ...` — passphrase accepted.
- [ ] `tar xzf` completed without errors.
- [ ] `sha256sum -c SHA256SUMS` — every file OK.
- [ ] Application units and Caddy stopped; PostgreSQL started alone.
- [ ] `globals.sql` applied; role/password reconciliation documented below.
- [ ] `pg_restore` completed; no unexplained errors.
- [ ] Media extracted to `/var/lib/apps/media`, owner `100:100`.
- [ ] Deploy of the manifest tag started the stack in dependency order.
- [ ] Flyway head matches the expected version.
- [ ] Caddy re-issued or still holds valid certificates.

## Reconciliation

| Table | Source count | Restored count | Delta / explanation |
| --- | --- | --- | --- |
| `identity.account` | | | |
| `studio.audit_event` | | | |
| `jublawoma.*` (main tables) | | | |
| `unclet.*` (main tables) | | | |
| `zelglihof.*` (main tables) | | | |
| Media files | | | |

Media sample: file name, size and SHA-256 compared with the manifest.

- [ ] A media sample hashes identically.
- [ ] Every site's home page and one content page load.
- [ ] One image loads through the assets service.
- [ ] Studio signs in and lists content.
- [ ] One durable write succeeds (test record removed afterwards).

## Deviations

| Step | What differed | Fix / follow-up |
| --- | --- | --- |
| | | |

## Result

- [ ] Drill passed; the archive restores on a from-zero host.
- [ ] A fresh backup from the restored host was taken, pulled and verified.
- [ ] The runbook was corrected from what actually happened.
- [ ] The open-work drill item is closed with this record (or the failure is
  added to [open work](../../work/open-work.md)).

Operator: ____________________  Date: __________

Owner acceptance (if required): ____________________  Date: __________
