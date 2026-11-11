# Release log

One row per deployment to the production host. The log answers "what is running,
what did we verify, and what do we roll back to" without reading chat history.

Add a row after the post-deploy verification, not before. Keep the last 20 rows;
older entries live in git history. A rollback is a new row that points at the
tag actually running afterwards.

| Date (UTC) | Tag deployed | Source commit | Migration | Verified by | Result | Rollback target | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| _example_ | `2026.10.24` | `abc1234` | `V011` | _name_ | pass / pass with notes / rolled back | `2026.10.17` | _what changed, what was checked_ |

The highest migration is currently V011 (V006 studio with audit, V007
intentionally unused, V008–V010 the site schemas and V011 analytics; the
monitoring role is in V001). The next
pre-launch change starts at V012. CI builds every image without pushing, and a
release tag publishes the same matrix with pinned base/tool images, actions and
the Caddy plugin. `latest` is never a deployment source.

## What to record

- **Tag** - the immutable image tag passed to `deploy.yml`.
- **Source commit** - the commit the tag points at.
- **Migration** - the highest Flyway version applied (currently V011).
- **Verified by** - the person who ran the checklist.
- **Result** - pass, pass with notes, or rolled back. A rollback row records the
  failing tag and the tag that is now running.
- **Rollback target** - the tag you would deploy if this release fails later.
- **Notes** - changed workflows, skipped checks, known issues.
