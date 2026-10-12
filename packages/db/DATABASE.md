# Database schema workflow

## Production (Vercel / Neon)

Production was bootstrapped with **`drizzle-kit push`**, not `drizzle-kit migrate`. The `drizzle.__drizzle_migrations` table may be empty even when the live schema is current.

**Do not add `db:migrate` to the deploy pipeline.** After pulling schema changes:

1. Review diffs locally: `pnpm --filter @env-manager/db db:push` (against a dev/staging database first).
2. Apply to production manually when intentional: run `db:push` with production `DATABASE_URL`, or apply the matching SQL from `src/migrations/` if you prefer explicit scripts (e.g. `0004_organizations.sql`).

One-off data scripts (e.g. `scripts/backfill-personal-orgs.ts`) are run separately; they are not part of Vercel builds.

## Local development

```bash
pnpm --filter @env-manager/db db:push    # sync schema to DATABASE_URL
pnpm --filter @env-manager/db db:studio  # browse data
```

`db:generate` / `db:migrate` remain available for teams that use migration journals; this repo’s production source of truth is **push + reviewed SQL** for major releases.
