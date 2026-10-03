# env-manager

![env-manager OG Image](https://env-manager-web.vercel.app/opengraph-image.png)

**Live app:** [https://env-manager-web.vercel.app](https://env-manager-web.vercel.app)

Env Manager is a web dashboard and pnpm/Turbo monorepo for storing and organizing environment variables and secrets across **projects** and **environments** (for example dev, staging, and production). Values are encrypted at rest, changes are recorded in an audit log, and you can import or export `.env`-style files from the UI.

The runnable application lives in `apps/web`. Shared server logic is in `packages/api`, `packages/auth`, `packages/db`, `packages/crypto`, and `packages/env`.

## Prerequisites

- **Node.js** 20 or newer (recommended for local development)
- **pnpm** [10.13.1](https://pnpm.io/) — pinned in the root `packageManager` field; enable via [Corepack](https://nodejs.org/api/corepack.html)
- **PostgreSQL** — connection string used as `DATABASE_URL` (for example [Neon](https://neon.tech) or any Postgres host)
- **GitHub OAuth app** — required for sign-in (`GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`)

## Install

```bash
git clone https://github.com/jayantrohila57/env-manager.git
cd env-manager
corepack enable
corepack prepare pnpm@10.13.1 --activate
pnpm install
```

## Environment variables

Create **`apps/web/.env`** (this path is what Drizzle Kit reads for database commands). The server validates these via `@env-manager/env`:

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `DATABASE_URL` | yes | PostgreSQL connection URL |
| `BETTER_AUTH_SECRET` | yes | Session secret; at least 32 characters |
| `BETTER_AUTH_URL` | yes | Public URL of the app (e.g. `http://localhost:3000` locally) |
| `CORS_ORIGIN` | yes | Allowed browser origin; usually the same as `BETTER_AUTH_URL` in dev |
| `ENCRYPTION_KEY` | yes | 64 hex characters (32 bytes) for AES-256-GCM secret storage |
| `GITHUB_CLIENT_ID` | yes | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | yes | GitHub OAuth app client secret |
| `NODE_ENV` | no | `development`, `production`, or `test` (defaults to `development`) |
| `SKIP_ENV_VALIDATION` | no | Set to `1` to skip Zod validation (not recommended) |
| `NEXT_PUBLIC_APP_URL` | no | Public site URL for metadata (defaults to the production Vercel URL) |

Example helpers for secrets (do not commit real values):

```bash
openssl rand -hex 32    # ENCRYPTION_KEY
openssl rand -base64 32 # BETTER_AUTH_SECRET (trim/pad to ≥32 chars if needed)
```

Configure your GitHub OAuth app callback URL to match Better Auth (typically `{BETTER_AUTH_URL}/api/auth/callback/github`).

## Database

Apply the schema to your database once `DATABASE_URL` is set:

```bash
pnpm db:push
```

Other database scripts (from the repo root):

- `pnpm db:migrate` — run Drizzle migrations
- `pnpm db:generate` — generate migration files
- `pnpm db:studio` — open Drizzle Studio

## Run the web app

From the repository root:

```bash
pnpm dev:web
```

This starts the Next.js app in `apps/web` on [http://localhost:3000](http://localhost:3000).

To run all workspace `dev` tasks via Turbo (currently the web app):

```bash
pnpm dev
```

Build and typecheck:

```bash
pnpm build
pnpm check-types
```

## Monorepo layout

| Path | Purpose |
| ---- | ------- |
| `apps/web` | Next.js UI, tRPC client, Better Auth routes |
| `packages/api` | tRPC routers (projects, environments, variables, audit) |
| `packages/db` | Drizzle schema and migrations |
| `packages/auth` | Better Auth configuration |
| `packages/crypto` | Encrypt/decrypt secret values |
| `packages/env` | Shared environment variable validation |

## Tech stack

- **App:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **API:** tRPC, TanStack Query
- **Auth:** Better Auth (GitHub OAuth)
- **Database:** PostgreSQL with Drizzle ORM
- **Tooling:** pnpm workspaces, Turborepo, Biome
- **Deployment:** [Vercel](https://env-manager-web.vercel.app) (production web app)

## Security

See [SECURITY.md](./SECURITY.md) for how to report vulnerabilities.
