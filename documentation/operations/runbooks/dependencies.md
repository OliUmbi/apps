# Dependency and version updates

**When:** the monthly digest refresh is due (D24), a runtime major is being
adopted, or a scanner reports a finding. The register of what is pinned where is
[external dependencies and versions](../../reference/versions.md).

## Monthly refresh (D24)

Do this once a month, in daylight, on a branch. It is a deliberate commit, not an
automation: the point is that someone looks at what changed.

1. **Record the start.** Note the date, the current `image_tag`, and the digests
   in the register (or read them from the owning files).
2. **Look up every current digest.**
   `docker buildx imagetools inspect <name>:<tag>` for each image in the register
   (the multi-arch manifest-list digest), or the Docker Hub tag API
   (`/v2/repositories/<repo>/tags/<tag>`). A digest change means the same tag was
   rebuilt upstream.
3. **Update tag and digest together** in the owning file. Never change a tag
   without checking its digest, and never leave a digest from the old tag.
   Runtime version bumps (Caddy, Node, temurin, ...) are separate, deliberate
   commits; this pass only picks up silent base rebuilds.
4. **Update the CI actions.** Check the latest release of every action, update
   the SHA and the version comment together.
5. **Update the scan tools** (`trivy`, `gitleaks`) the same way, including their
   digests in both workflows.
6. **Run the gate:** `pnpm check`, `pnpm typecheck`, `pnpm test` (with a migrated
   database), `pnpm build`, `services\mvnw.cmd -f services/pom.xml test`, and
   `docker compose -f infrastructure/compose.dev.yaml --env-file .env config`.
7. **Run the blocking scans locally** (or read the weekly workflow):
   `trivy fs -c trivy.yaml --severity HIGH,CRITICAL web services database` and
   `gitleaks detect`; triage per [security](security.md#scan-triage). The
   repository config mirrors Maven Central so POM resolution is not rate-limited.
8. **Before a release, scan the built images** (manual, not in CI):
   `trivy image ghcr.io/oliumbi/apps-<name>:<tag> --severity HIGH,CRITICAL`.
   The images are pinned by digest, so this measures the bytes you deploy.
9. **Commit** as `chore: refresh pinned digests (D24)`, push, and confirm the
   `security` workflow and the image build are green.
10. **Record the run** in the [release log](../releases.md): date, tag, which
    digests changed and the gate result. If a step was skipped, say so.

## Runtime version bumps

A runtime bump changes behavior, so it is not part of the digest refresh:

1. Change the version and digest in the owning file (Dockerfile, CI container
   pin, `services/pom.xml`, `web/pnpm-workspace.yaml` catalog).
2. Run the full gate and the local scans above.
3. Deploy a branch build if the change is risky; otherwise ship it as its own
   commit and a normal [release](release.md).
4. Update the register and close the matching item.

Held majors stay deliberate. The current holds are in
[the register](../../reference/versions.md#held-upgrades-deliberate-not-drift);
do not drift across them incidentally.

## If a scan finds something

Follow [security](security.md#scan-triage). A finding with no fix available is
recorded as accepted risk with a reason and a review date, not silently ignored.

## Done when

- Every pin matches its owning file and CI is green.
- The scan workflows are green (or the finding is recorded).
- The register and the release log reflect what was bumped.
