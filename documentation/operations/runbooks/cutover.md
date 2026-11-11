# Cutover and legacy retirement

**When:** the replacement host has passed setup, restore and import rehearsal, and
the owner has accepted the observation plan. This is a one-time, deliberate
sequence - never improvise it during a normal deploy window. The detailed
playbook is [migration: cutover](../../work/migration.md#cutover-playbook).

## Preconditions

- [Server setup](setup.md) verified on the replacement host, including secure
  cookies, alerts to the phone and the restore drill.
- The owner-led import rehearsal and reconciliation pass, and the restore drill
  completed against meaningful rehearsal data.
- Final content, legal pages and photos approved.
- The router and public DNS still point at legacy.
- A tested rollback path and a current legacy backup exist.

## Sequence

1. Confirm the legacy backup is restore-readable and the new-host evidence is
   current. Lower TTLs if needed and record the old and new artifact ids.
2. Freeze legacy writes; take the final export and media manifest.
3. Repeat the rehearsed manual import into PostgreSQL and reconcile counts,
   statuses, IDs and media.
4. Deploy the accepted pinned tag and run internal smoke tests.
5. Switch router forwarding and DNS, then explicitly enable live updates:

   ```sh
   ansible-playbook playbooks/site.yml -e image_tag=<accepted-tag> -e dyndns_enabled=true
   ```

   Pre-cutover, `dyndns_enabled` is `false`; do not enable it earlier, even on a
   parallel host (RV-03). `site.yml` owns the dyndns role; `deploy.yml` does not,
   so this is the run that flips live updates. Passing the tag again is
   idempotent.
6. Verify TLS, redirects, forms, Studio permissions, media, logs, health and
   mail. Take a fresh backup and pull it.
7. Record the release, the observation window and the owner sign-off.

## Point of no return

The first **durable public write** on the new system is the boundary (D23/RV-04).
Before it, routing may return to legacy. After it, a DNS-only rollback would
strand accepted submissions: export/replay those writes or roll forward. Record
the boundary and the decision in the cutover notes.

## Retire legacy

After the observation window is accepted:

1. Keep the final encrypted archives and confirm they restore.
2. Remove the retired DNS records (including `api.*`), credentials, containers,
   volumes and scheduled jobs.
3. Remove `legacy/` only when its useful knowledge lives in the maintained docs.
4. Record the retention dates and the observation result.

## Done when

- The cutover is recorded, the observation window passed and the owner signed off.
- A fresh backup from the new host exists and pulls.
- Legacy access, DNS and credentials are retired; `legacy/` is removed only after
  its knowledge is preserved.
