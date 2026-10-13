# Database schema workflow

## Production (Vercel / Neon)

Production was bootstrapped with **`drizzle-kit push`**, not `drizzle-kit migrate`. The `drizzle.__drizzle_migrations` table may be empty even when the live schema is current.

**Owner sign-off:** Jayant approved this path for production (manual `db:push` / reviewed SQL, no migrate on Vercel build). See [docs/PRODUCTION_DEPLOY.md](../../docs/PRODUCTION_DEPLOY.md#database-production-schema-path).

**Do not add `db:migrate` to the deploy pipeline.** After pulling schema changes:

1. Review diffs locally: `pnpm --filter @collidr/db db:push` (against a dev/staging database first).
2. Apply to production manually when intentional: run `db:push` with production `DATABASE_URL`, or apply the matching SQL from `src/migrations/` if you prefer explicit scripts (e.g. `0004_organizations.sql`).

One-off data scripts (e.g. `scripts/backfill-personal-orgs.ts`) are run separately; they are not part of Vercel builds.

## Local development

```bash
pnpm --filter @collidr/db db:push    # sync schema to DATABASE_URL
pnpm --filter @collidr/db db:studio  # browse data
```

`db:generate` / `db:migrate` remain available for teams that use migration journals; this repo’s production source of truth is **push + reviewed SQL** for major releases.

## Reset + seed (production)

When a platform migration intentionally wipes application data but must **keep the owner’s login**:

1. Neon **backup branch** first.
2. Apply combined migration ([docs/PLATFORM_MIGRATION_COMBINED.md](../../docs/PLATFORM_MIGRATION_COMBINED.md)).
3. Run from repo root with explicit env — full procedure in [docs/DB_RESET.md](../../docs/DB_RESET.md):

```bash
RESET_CONFIRM=yes KEEP_USER_EMAIL=owner@example.com DATABASE_URL='…' pnpm db:reset-seed
```

Never run `db:reset-seed` against production default without approval and backup.
