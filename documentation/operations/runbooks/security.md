# Security

**When:** the weekly scan reports something, a credential may be exposed, an
editor joins, changes role or leaves, or data must be deleted. Policy is in
[access and security](../access-and-security.md); the accepted threat model is
[O-006](../../reference/decisions.md#o-006-threat-model-accepted-2026-11).

## Scan triage

- The **weekly `security.yml`** run is blocking: Trivy filesystem scan, gitleaks
  and `pnpm audit --prod`.
- Pull requests run the **report-only** variant in `ci.yml`, so an unrelated CVE
  never blocks a hotfix. A finding still needs a decision.
- Trivy loads [`trivy.yaml`](../../../trivy.yaml), which mirrors Maven Central
  to Google's public mirror; resolving the Maven poms otherwise makes enough
  anonymous requests to earn a 429 and a 30-minute block.
- A **secret** finding is always urgent: remove it from the working tree, rotate
  the credential (below), and check the audit trail for use.

For a dependency or base-image finding:

1. Read the package, installed version, fixed version and severity.
2. If a fix exists, bump the pin or lockfile and run the gate. Ship it as its own
   commit; do not mix it with the monthly digest refresh.
3. If no fix exists, record the accepted risk with the reason, the compensating
   control and a review date in [technical debt](../../work/tech-debt.md). Do not
   leave it only in a scanner dashboard.
4. Re-run the blocking scan or wait for the next scheduled run.

## Edge checks

After a change to Caddy, authentication or the public forms:

```sh
curl -I https://<site>/
# expect: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy,
#         Permissions-Policy, Content-Security-Policy
```

- Load one page with every embed the site uses; there is no CSP report endpoint,
  so a broken policy shows up as a browser error or a missing asset.
- Burst more than 20 requests in two seconds from one address; expect `429`.
- Confirm `/api/session/login` is limited to 10 per minute.
- Confirm the body limits: public sites 10 MB, Studio 55 MB.
- Confirm the Studio cookie is `__Host-studio_session` with `Secure`, `HttpOnly`
  and `SameSite=Lax`.

## Rotate a secret

**When** a credential leaked, a provider rotated it, or the quarterly review
reaches it.

1. Update the key in the Ansible vault (`ansible-vault edit
   group_vars/all/vault.yml`).
2. Add or update the service template in `ansible/roles/app/templates/` if the
   variable is new.
3. Deploy the current tag: `ansible-playbook playbooks/deploy.yml -e
   image_tag=<current-tag>`. An env-only change needs no image rebuild.
4. Verify the service starts and its health check passes.
5. Revoke the old credential at the provider or in the database as soon as the
   new one works.
6. Record the rotation date where the credential lives.

## A leaked credential

1. Treat it as compromised even if it was deleted from git; history is public to
   everyone who ever cloned.
2. Rotate it first, then remove it, then check logs and the audit trail for use.
3. If it is a database role, also confirm the role's grants are still the
   intended ones.
4. Record the incident and the follow-up in the registers.

## Access review

When an editor leaves or changes role:

1. Disable the identity account; sessions are revoked server-side.
2. Remove site permissions that are no longer needed.
3. Confirm no shared credential existed for that person.
4. If a deploy key, token or vault value was exposed, rotate it and check the
   audit trail.

Account lifecycle in Studio:

- **Create** through Studio account administration and grant `studio.admin` or
  `<site>.manage` explicitly.
- **Change role** by updating permissions; verify the editor loses the old site
  immediately (the server checks, not only the UI).
- **Disable** to revoke sessions; **remove** only when retention allows. Never
  share an account between people.

## Delete personal data or an asset

1. Identify the owner table and the retention rule; there is no generic delete
   button for every domain.
2. Use the owning service or Studio operation where one exists. Do not run ad hoc
   `DELETE` on production without a reviewed statement and a backup.
3. For an asset, use the assets deletion path so metadata and files stay
   consistent; failed file removal is cleaned up later.
4. Record what was deleted, why, and the legal basis or retention decision.
5. Backups age out on their own schedule; do not promise immediate removal from
   archives.

## Done when

- The scan, rotation or access change is complete and verified.
- A finding with no fix is recorded as accepted risk, with a review date.
- Any exposed credential is rotated, and the event is recorded.
