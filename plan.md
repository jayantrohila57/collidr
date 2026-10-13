# Development planning

**This file is a high-level index.** Detailed specs live under `docs/`. Active work is tracked in [GitHub issues](https://github.com/jayantrohila57/env-manager/issues).

## Current stage

**Platform organization product** — multi-tenant orgs, teams, project grants, audit timeline, notifications, and soft deletes (feature-flagged). Single production app: `apps/web`.

## Specs & plans

| Document | Focus |
|----------|--------|
| [docs/ACTIONS_PERMISSIONS_AUDIT.md](./docs/ACTIONS_PERMISSIONS_AUDIT.md) | Canonical actions, roles, audit, timelines |
| [docs/PLAN_PLATFORM_APPS.md](./docs/PLAN_PLATFORM_APPS.md) | Multi-app Vercel layout; **§14 SSO/subdomain decision** |
| [docs/PLAN_MCP_AND_CONSOLE.md](./docs/PLAN_MCP_AND_CONSOLE.md) | Future `apps/mcp` and `apps/console` |
| [docs/ORGANIZATION_MIGRATION.md](./docs/ORGANIZATION_MIGRATION.md) | Enabling organizations |
| [docs/PLATFORM_MIGRATION_COMBINED.md](./docs/PLATFORM_MIGRATION_COMBINED.md) | Combined SQL `0007` for prod |
| [docs/DB_RESET.md](./docs/DB_RESET.md) | Reset-seed after schema cut |
| [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) | coss ui & spacing |
| [docs/PRODUCTION_DEPLOY.md](./docs/PRODUCTION_DEPLOY.md) | Vercel prod checklist, flags, deploy limits |
| [UI.md](./UI.md) | Domain/page architecture |

## Workflow rules

1. Open a GitHub issue for every task or bug.
2. Implement on **`main`**; commit with **`Fixes #<issue>`**.
3. `git pull --rebase origin main` before push; **no** force-push, amend-on-shared-history, or branch preview deploys.
4. UI changes: follow DESIGN_SYSTEM tokens; verify in `pnpm dev:web`.

## Historical note

Earlier “Phase 2 — 45% complete” estimates in this file’s previous revision are **obsolete**. The codebase now includes orgs, grants, audit, notifications, and soft-delete infrastructure behind flags.
