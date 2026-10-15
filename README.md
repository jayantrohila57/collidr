# Loftlancer

![Loftlancer OG Image](https://studio.loftlancer.com/opengraph-image.png)

**Live app:** [https://loftlancer.com/studio](https://loftlancer.com/studio)

Loftlancer is a web dashboard and **pnpm/Turbo monorepo** for storing and organizing environment variables across **organizations**, **projects**, and **environments** (dev, staging, production). Values are encrypted at rest; changes flow through a **canonical actions** layer with optional **audit timeline**, **notifications**, and **soft deletes**.

## Workflow & contributions

- Track work in [GitHub issues](https://github.com/jayantrohila57/loftlancer/issues) on the Loftlancer project. Agents work **from issues only**; closing commits use **`Fixes #N`**.
- Delivery: commits on **`main`** → `git pull --rebase origin main` → push (no feature-branch previews, no force-push). See [AGENTS.md](./AGENTS.md).

## Monorepo layout

| Path | Purpose |
| ---- | ------- |
| `apps/web` | **Legacy** production app (unchanged until P3 cutover [#97](https://github.com/jayantrohila57/loftlancer/issues/97)) |
| `apps/auth` | Platform auth issuer — sign-in, device flow, MCP OAuth config, email-link origin |
| `apps/studio` | Product UI (parity with `apps/web`); per-app tRPC + session via auth redirects |
| `apps/account` | Account settings at `/settings/*`; per-app tRPC subset |
| `apps/www` | Public marketing landing (Decision 4); CTAs → auth `sign-in` with `return_to` studio |
| `apps/docs` | Public Fumadocs site (product guides, API overview, MCP reference) |
| `packages/api` | tRPC routers (projects, orgs, access, audit, notifications, account, …) |
| `packages/actions` | Canonical action registry, org roles, `requireAction` evaluation |
| `packages/auth` | Better Auth (GitHub OAuth, organizations, teams) |
| `packages/db` | Drizzle schema, migrations, soft-delete helpers, `db:reset-seed` |
| `packages/notifications` | Notification types, triggers, idempotent writers |
| `packages/crypto` | AES-256-GCM encrypt/decrypt for secret values |
| `packages/env` | Shared Zod env validation & feature flags |
| `packages/config` | Shared TypeScript/Biome config |
| `packages/ui` | Shared coss/shadcn UI (`@loftlancer/ui`) — marketing chrome and primitives |

Further apps: `apps/console`, `apps/mcp`, `apps/docs`, … — see [docs/PLAN_PLATFORM_APPS.md](./docs/PLAN_PLATFORM_APPS.md). MCP deploy env: [docs/MCP_DEPLOY.md](./docs/MCP_DEPLOY.md).

## Product concepts

| Area | Behavior |
| ---- | -------- |
| **Roles** | Org **Owner**, **Manager**, **Member** (legacy `admin` → Manager). Platform **Admin** reserved for future console. |
| **Teams** | Better Auth teams under each organization |
| **Project access** | Per-project manager rows, team links, and member **CRUD grants** |
| **Actions** | `@loftlancer/actions` names every gated operation; server uses `requireAction` |
| **Audit** | `audit_event` + Timeline UIs when `ACTIONS_AUDIT_ENABLED=true` |
| **Soft delete** | `deleted_at` / `deleted_by` when `SOFT_DELETES_ENABLED=true` |
| **Organizations** | `/dashboard/organizations` hub (members, teams, invitations, roles, settings, timeline) |
| **Account settings** | `/dashboard/settings/*` — profile, sessions, accounts, export, delete, personal timeline |

Deep specs: [docs/ACTIONS_PERMISSIONS_AUDIT.md](./docs/ACTIONS_PERMISSIONS_AUDIT.md), [docs/SOFT_DELETES.md](./docs/SOFT_DELETES.md), [UI.md](./UI.md), [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md).

## Prerequisites

- **Node.js** 20+
- **pnpm** [10.13.1](https://pnpm.io/) — `packageManager` in root `package.json`; use [Corepack](https://nodejs.org/api/corepack.html)
- **PostgreSQL** — `DATABASE_URL` (e.g. [Neon](https://neon.tech))
- **GitHub OAuth app** — `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`

## Install

```bash
git clone https://github.com/jayantrohila57/loftlancer.git
cd loftlancer
corepack enable
corepack prepare pnpm@10.13.1 --activate
pnpm install
```

## Environment variables

Create **`apps/web/.env`** (Drizzle Kit reads this path for database commands). Validated via `@loftlancer/env`:

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `DATABASE_URL` | yes | PostgreSQL connection URL |
| `BETTER_AUTH_SECRET` | yes | Session secret (≥ 32 characters) |
| `BETTER_AUTH_URL` | yes | Public app URL (e.g. `http://localhost:3000`) |
| `CORS_ORIGIN` | yes | Browser origin (usually same as `BETTER_AUTH_URL` in dev) |
| `ENCRYPTION_KEY` | yes | 64 hex chars (32 bytes) for AES-256-GCM |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | yes | GitHub OAuth |
| `ORGANIZATIONS_ENABLED` | no | `true` to scope projects to active org |
| `NOTIFICATIONS_ENABLED` | no | In-app notifications |
| `VARIABLES_V2_ENABLED` | no | Typed variables (`secret` / `config`) |
| `ACTIONS_AUDIT_ENABLED` | no | `audit_event` + timeline routes |
| `SOFT_DELETES_ENABLED` | no | Soft delete semantics |
| `NEXT_PUBLIC_*` | no | Client mirrors for flags above (rebuild after change) |
| `NODE_ENV` | no | `development` \| `production` \| `test` |
| `SKIP_ENV_VALIDATION` | no | `1` skips Zod (not recommended) |

Example secret generation:

```bash
openssl rand -hex 32    # ENCRYPTION_KEY
openssl rand -base64 32 # BETTER_AUTH_SECRET
```

GitHub OAuth callback: `{BETTER_AUTH_URL}/api/auth/callback/github`.

## Database

Local sync:

```bash
pnpm db:push
```

| Script | Purpose |
| ------ | ------- |
| `pnpm db:migrate` | Drizzle migrate (journal-based workflows) |
| `pnpm db:generate` | Generate migration SQL |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm db:reset-seed` | **Destructive** wipe + sample seed — [docs/DB_RESET.md](./docs/DB_RESET.md) |

Production uses **reviewed SQL / push**, not automatic migrate on deploy — [packages/db/DATABASE.md](./packages/db/DATABASE.md). Major platform cut: [docs/PLATFORM_MIGRATION_COMBINED.md](./docs/PLATFORM_MIGRATION_COMBINED.md) (Neon backup → migrate → flags → optional reset-seed with owner retention).

## Run & build

```bash
pnpm dev:web
pnpm dev:www    # marketing site on :3006          # Next.js on http://localhost:3000
pnpm dev              # Turbo dev (all apps with dev tasks)
pnpm build
pnpm check-types
pnpm a11y             # accessibility checks (web, Turbo task `a11y` → web)
```

**Turbo / remote cache (`a11y`):** Root `pnpm a11y` runs the `a11y` pipeline in `turbo.json` (scoped to `web`). Turbo restores a cached run when inputs (`e2e/**`, `playwright.config.ts`, and default package files) and env are unchanged. Cache keys include `globalEnv` feature flags plus `tasks.a11y.env` (CI, Playwright/E2E URLs and secrets, auth/DB URLs). Change those env vars or e2e sources to invalidate the cache — same pattern as `build` and CI `pnpm a11y`.

## Tech stack

- **App:** Next.js, React, TypeScript, Tailwind, **coss ui** (Base UI) via shadcn registry
- **API:** tRPC, TanStack Query
- **Auth:** Better Auth (GitHub, organizations, teams)
- **Database:** PostgreSQL, Drizzle ORM
- **Tooling:** pnpm workspaces, Turborepo, Biome
- **Deploy:** Vercel — production from **`main`** only (`studio.loftlancer.com`)

## Documentation index

| Doc | Topic |
| --- | ----- |
| [AGENTS.md](./AGENTS.md) | Issues, git, agent rules |
| [UI.md](./UI.md) | Domain architecture & page patterns |
| [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) | coss ui, spacing tokens, components |
| [docs/DB_RESET.md](./docs/DB_RESET.md) | Reset-seed policy |
| [docs/PLAN_PLATFORM_APPS.md](./docs/PLAN_PLATFORM_APPS.md) | Multi-app + SSO decision §14 |
| [docs/PLAN_MCP_AND_CONSOLE.md](./docs/PLAN_MCP_AND_CONSOLE.md) | MCP & console research |
| [docs/PRODUCTION_DEPLOY.md](./docs/PRODUCTION_DEPLOY.md) | Production deploy checklist & Vercel limits |
| [SECURITY.md](./SECURITY.md) | Vulnerability reporting |

## Security

See [SECURITY.md](./SECURITY.md).
