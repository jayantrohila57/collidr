# Scripts directory

Automation helpers for env-manager. **Delivery is issue → commit on `main` → push** ([AGENTS.md](../AGENTS.md), [commit-workflow.md](./commit-workflow.md)).

## Release scripts

### `release.sh`

Version bump, CHANGELOG update, commit, and annotated tag.

```bash
pnpm run release:patch
pnpm run release:minor
pnpm run release:major
```

Tags are pushed with the release commit on **`main`**.

### `quick-commit.sh`

Interactive conventional commits for local work (still requires issue linkage and `Fixes #N` when finishing work).

## Root `package.json` scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev:web` | Next.js dev server |
| `pnpm build` | Turbo build |
| `pnpm check-types` | Typecheck all packages |
| `pnpm db:push` / `db:studio` / `db:reset-seed` | Database ([packages/db/DATABASE.md](../packages/db/DATABASE.md)) |
| `pnpm release:*` | Semantic version release |

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
