# Scripts directory

Automation helpers for Loftlancer. **Delivery is issue → feature branch → `dev` → release PR to `main`** ([AGENTS.md](../AGENTS.md), [commit-workflow.md](./commit-workflow.md)).

## Release scripts

One product version for the whole platform lives in the root `package.json`.
See [docs/RELEASING.md](../docs/RELEASING.md) for the full procedure.

| Script | Purpose |
|--------|---------|
| `pnpm release:prepare <major\|minor\|patch>` | Bump the version and date the `[Unreleased]` changelog section |
| `pnpm release:check` | CI guard: version above `origin/main` and a dated changelog section |
| `pnpm release:notes [version]` | Print one version's changelog section |
| `pnpm release:publish` | After the release merge: tag `main` and create the GitHub Release |

### `quick-commit.sh`

Interactive conventional commits for local work (still requires issue linkage and `Fixes #N` when finishing work).

## Root `package.json` scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev:web` | Next.js dev server |
| `pnpm build` | Turbo build |
| `pnpm check-types` | Typecheck all packages |
| `pnpm db:push` / `db:studio` / `db:reset-seed` | Database ([packages/db/DATABASE.md](../packages/db/DATABASE.md)) |
| `pnpm release:*` | Semantic versioning ([docs/RELEASING.md](../docs/RELEASING.md)) |

## Deploy

- **Only `main`** triggers production on Vercel.
- Before push: `git pull --rebase origin main`.
- No branch previews; no force-push.

## Requirements

- Git, Node.js 20+, pnpm 10.13.1
- Bash for `*.sh` (Git Bash on Windows)

## Notes

- Update [CHANGELOG.md](../CHANGELOG.md) before version releases.
- Destructive `db:reset-seed` requires env documented in [docs/DB_RESET.md](../docs/DB_RESET.md) — never run on production without backup and approval.
