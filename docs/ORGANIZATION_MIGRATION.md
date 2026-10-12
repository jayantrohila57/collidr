# Organization migration (Better Auth)

**Status:** Migration `0004_organizations.sql` is in the repo but **not applied to production** by the agent.  
**Prod today:** 15 projects with env vars — all remain on `project.user_id` until you run the steps below.

`ORGANIZATIONS_ENABLED` defaults to **false**. The live app behaves exactly as before until you finish this runbook and flip env vars.

---

## Phase 1 — Apply database migration (you approve & run)

From the repo root, against **production** `DATABASE_URL`:

```bash
cd packages/db
pnpm drizzle-kit migrate
# or apply SQL directly:
# psql "$DATABASE_URL" -f src/migrations/0004_organizations.sql
```

This creates:

- `organization`, `member`, `invitation`
- `session.active_organization_id` (nullable)
- `project.organization_id` (nullable FK)

Existing rows are untouched. Projects still work via `user_id`.

---

## Phase 2 — Backfill personal organizations (no data loss)

Dry-run is not built in; review the script first, then run:

```bash
cd packages/db
DATABASE_URL="your-prod-url" pnpm exec tsx scripts/backfill-personal-orgs.ts
```

The script, for **each user** who owns projects:

1. Creates a personal org (`"{name}'s Workspace"` / slug `personal-{userId-prefix}`)
2. Adds the user as `owner` in `member`
3. Sets `project.organization_id` for all projects where `user_id` matches

It does **not** delete projects or env vars.

---

## Phase 3 — Apply Drizzle schema patch (required before enabling orgs)

After migration + backfill, merge the post-migration fields (see `packages/db/src/schema/patches/after-0004-README.md`):

- `session.activeOrganizationId` in `auth.ts`
- `project.organizationId` in `projects.ts`
- Export `organization` tables from `schema/index.ts` (already exported when you pull latest)

Redeploy the app **before** enabling the feature flag.

---

## Phase 4 — Enable organizations

On Vercel (production):

```env
ORGANIZATIONS_ENABLED=true
NEXT_PUBLIC_ORGANIZATIONS_ENABLED=true
```

Redeploy. Users without an active org are sent to `/dashboard/onboarding` to create one.

---

## Rollback

1. Set both org env vars to `false` and redeploy (instant fallback to `user_id` scoping).
2. DB rollback is optional; nullable columns can remain unused.

---

## Verification checklist

- [ ] All 15 projects visible after backfill
- [ ] Env vars still decrypt/create
- [ ] Org switcher lists personal org
- [ ] New project attaches to active org
- [ ] Invites/members settings load (owner/admin)
