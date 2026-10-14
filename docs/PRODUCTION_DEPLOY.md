# Production deploy (Vercel)

Collidr ships from **`main` only**. Day-to-day work merges **feature branch → `dev` → `main`**; only pushes to **`main`** trigger Vercel production builds.

Production is **five separate Vercel Hobby projects** (no monorepo Services router): `auth`, `studio`, `console`, `mcp`, and `docs`. Each project uses **Root Directory** `apps/<app>` and `apps/<app>/vercel.json`:

- `git.deploymentEnabled`: `{ "*": false, "main": true }` — no deploys from `dev` or feature branches.
- `ignoreCommand`: exit `0` (skip build) when `VERCEL_GIT_COMMIT_REF` is not `main`; on `main`, run `turbo-ignore` for unchanged apps.

Cross-app URLs use explicit `NEXT_PUBLIC_*` env vars; session SSO uses auth **cross-app finish** + sibling **establish-session** (not shared cookies on `*.vercel.app`).

This runbook addresses **Hobby / Pro deploy limits**, **feature-flag reliability** (`NEXT_PUBLIC_*` + Turbo cache), and the **approved production schema path** (`drizzle-kit push`).

Related: [ORGANIZATION_MIGRATION.md](./ORGANIZATION_MIGRATION.md), [packages/db/DATABASE.md](../packages/db/DATABASE.md), [scripts/commit-workflow.md](../scripts/commit-workflow.md).

---

## Production deploy checklist

Use this before and after every intentional production release.

### 1. Prepare the change

- [ ] GitHub issue exists and describes the change.
- [ ] Changes merged to **`dev`**, then **`main`** (see [scripts/commit-workflow.md](../scripts/commit-workflow.md)).
- [ ] `git pull --rebase origin main` on a clean working tree before the production merge.
- [ ] Schema changes reviewed locally (`pnpm db:push` against dev/staging first) — see [Database](#database-production-schema-path) below.
- [ ] Batch unrelated fixes into **one commit push** when possible (reduces deploy count).

### 2. Feature flags (server + client)

Paired flags must match on Vercel **Production** before deploy:

| Capability | Server (runtime) | Client (build-time) | Doc |
|------------|------------------|---------------------|-----|
| Organizations | `ORGANIZATIONS_ENABLED` | `NEXT_PUBLIC_ORGANIZATIONS_ENABLED` | [ORGANIZATION_MIGRATION.md](./ORGANIZATION_MIGRATION.md) |
| Notifications | `NOTIFICATIONS_ENABLED` | `NEXT_PUBLIC_NOTIFICATIONS_ENABLED` | [PLATFORM_MIGRATION_0005.md](./PLATFORM_MIGRATION_0005.md) |
| Variables v2 | `VARIABLES_V2_ENABLED` | `NEXT_PUBLIC_VARIABLES_V2_ENABLED` | [PLATFORM_MIGRATION_0005.md](./PLATFORM_MIGRATION_0005.md) |
| Audit / timeline | `ACTIONS_AUDIT_ENABLED` | `NEXT_PUBLIC_ACTIONS_AUDIT_ENABLED` | [PLATFORM_MIGRATION_0006.md](./PLATFORM_MIGRATION_0006.md) |
| Soft deletes | `SOFT_DELETES_ENABLED` | *(server only)* | [SOFT_DELETES.md](./SOFT_DELETES.md) |

- [ ] Server flag and `NEXT_PUBLIC_*` mirror set to the same value (`true` / `false`) for every **paired** row.
- [ ] DB migration / `db:push` for that capability is already applied on production **before** enabling the flag.

### 3. `NEXT_PUBLIC_*` and redeploy

`NEXT_PUBLIC_*` values are **inlined at `next build`**. Changing them in the Vercel dashboard does **not** update the client bundle until you **redeploy**.

- [ ] After any `NEXT_PUBLIC_*` change: trigger **Redeploy** (or push a commit to `main`).
- [ ] Turbo remote cache: `turbo.json` `globalEnv` and `tasks.build.env` must list every feature flag (see `packages/env/src/feature-flags.ts` and its unit test). Otherwise a cache hit can reuse a build produced with stale flags.

### 4. Verify build locally

```bash
pnpm install
pnpm turbo run build --filter=web
pnpm check-types
```

- [ ] `build --filter=web` succeeds with production-like env (or CI secrets).

### 5. Push and confirm Vercel

```bash
git add -A
git commit -m "feat: …

Fixes #<issue>"
git pull --rebase origin main
git push origin main
```

- [ ] Vercel production deployment completes successfully.
- [ ] Smoke-test critical paths (sign-in, org switcher if enabled, create variable).
- [ ] In-app **Settings → Deploy runbook** shows no server/client flag mismatches (paired flags).

### 6. Rollback

- [ ] Revert commit on `main` **or** redeploy a known-good deployment from the Vercel dashboard.
- [ ] For bad flags: set server + `NEXT_PUBLIC_*` back and **redeploy**.

---

## Vercel deploy rate limits (mitigations)

Vercel accounts limit **how many deployments** you can create per day (Hobby is stricter than Pro). This repo’s **main-only** workflow means **each push = one production deploy**.

| Mitigation | Detail |
|------------|--------|
| **Batch work** | Land multiple fixes in a single push instead of many small pushes. |
| **No preview spam** | Do not open feature branches for routine delivery; previews are disabled by policy ([AGENTS.md](../AGENTS.md)). |
| **Validate before push** | Run `pnpm turbo run build --filter=web` locally to avoid failed deploys that still consume quota. |
| **Env-first, then code** | Apply DB changes and set Vercel env vars **before** the code that depends on them; combine flag + code in one redeploy when possible. |
| **Use Vercel UI for hotfix redeploy** | Re-running an existing deployment does not require a new commit; prefer that for “rebuild after `NEXT_PUBLIC_*` only” changes. |

---

## Database: production schema path

**Owner-approved path (Jayant):**

1. **Major / reviewed SQL** for platform cuts (e.g. `0007_platform_combined_for_prod.sql`) — Neon **backup branch** first. See [PLATFORM_MIGRATION_COMBINED.md](./PLATFORM_MIGRATION_COMBINED.md).
2. Day-to-day schema sync: **`drizzle-kit push`** against production `DATABASE_URL` when intentional — not on every Vercel build.
3. **Do not** wire `db:migrate` into the Vercel deploy pipeline.

| Sign-off item | Status |
|---------------|--------|
| Production schema sync uses **`db:push` + reviewed SQL**, not automatic migrate on deploy | **Approved** |
| Neon backup before intentional prod schema cut | **Required** |
| `db:reset-seed` on production only with explicit owner approval + `RESET_CONFIRM` | **Required** |

Full workflow: [packages/db/DATABASE.md](../packages/db/DATABASE.md).

---

## Turbo `globalEnv` reference

Root `turbo.json` must include every `NEXT_PUBLIC_*` feature flag in `globalEnv` and the matching server keys in `tasks.build.env`. The list is defined in code:

- `packages/env/src/feature-flags.ts`
- Test: `pnpm --filter @collidr/env test` (parses `turbo.json`)

When adding a new paired flag, update `packages/env/src/web.ts`, `packages/env/src/server.ts`, `turbo.json`, and `feature-flags.ts` together.
