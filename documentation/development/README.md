# Development

How to set up, change and verify the repository. Commands are authoritative here;
CI mirrors them in [CI/CD](ci-cd.md).

| Page | Owns |
| --- | --- |
| [Local setup](local-setup.md) | requirements, environment, running the stack, ports |
| [Verification](verification.md) | the gate for every kind of change |
| [CI/CD](ci-cd.md) | workflows, image publishing, release flow |

Local package detail lives next to the code:
[web/README.md](../../web/README.md), [services/README.md](../../services/README.md),
[database/README.md](../../database/README.md).

## Daily loop

1. Read the page that owns the area you are changing
   ([architecture](../architecture/README.md) → subsystem → code README).
2. Make the smallest complete change. Update the docs that own its contract or
   procedure in the same change.
3. Run the gate from [verification](verification.md) for what you touched.
4. Add unfinished follow-up work to [open work](../work/open-work.md) or
   [technical debt](../work/tech-debt.md); do not leave a TODO in code.
5. Commit with the scope convention (`web/packages: ... (W2-D)`,
   `docs: ...`). Keep docs updates with the behavior they describe.

## Repository shape

| Path | What |
| --- | --- |
| `web/` | pnpm workspace: sites and shared packages |
| `services/` | Maven reactor: identity, messaging, assets, shared |
| `database/` | Flyway migrations (schema source of truth) |
| `infrastructure/` | production units, Caddy, monitoring, dev compose |
| `ansible/` | server setup, deploy, backup, housekeeping |
| `documentation/` | this tree |
| `legacy/` | the old stack; reference only, never a place to work |

## Rules that save time

- `pnpm check` is Biome; `pnpm typecheck` runs `pnpm generate` first. Run both
  from `web/`.
- After any `web/packages/*` change, build Studio as well
  (`pnpm --filter studio build`).
- Never edit generated Paraglide output; edit
  `packages/i18n/messages/de-CH.json`.
- Route trees are committed; regenerate with `pnpm dev`/`pnpm build` and commit
  them after changing routes.
- Flyway owns the schema. Pre-launch, edit the owning migration in place and
  recreate the local database.
- Secrets never enter git. Local values go in the gitignored root `.env`.
