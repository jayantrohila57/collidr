# Organization migration (Better Auth)

**Production status (Jayant):** Migration `0004`, personal-org backfill, and Drizzle schema patch are **applied**. All projects have `organization_id`; enable orgs on Vercel when ready.

`ORGANIZATIONS_ENABLED` defaults to **false**. With flags off, the app scopes projects by `user_id` only (same as before).

---

## Database changes (already on prod)

`0004_organizations.sql` added:

- `organization`, `member`, `invitation`
- `session.active_organization_id` (nullable)
- `project.organization_id` (nullable FK, index `project_organization_id_idx`)

Backfill: `packages/db/scripts/backfill-personal-orgs.ts` (already run).

**Schema sync:** Production uses **`drizzle-kit push`**, not migrate. See `packages/db/DATABASE.md`. Do not wire `db:migrate` into deploy.

---

## Application enablement

1. Deploy code that includes the Drizzle patch (`session.activeOrganizationId`, `project.organizationId`).
2. Set on Vercel (production):

```env
ORGANIZATIONS_ENABLED=true
NEXT_PUBLIC_ORGANIZATIONS_ENABLED=true
```

3. Redeploy (required: `NEXT_PUBLIC_*` is inlined at build time; Turbo must see both flags in `turbo.json` `globalEnv` / `build.env` or a remote cache hit can ship a client bundle with org UI still disabled). Full checklist: [PRODUCTION_DEPLOY.md](./PRODUCTION_DEPLOY.md).

Users with **no** organization membership are sent to `/dashboard/onboarding`. Users with orgs but no active session org get the first org set automatically; they can switch in the sidebar.

---

## Behavior when enabled

- **List/create projects:** Scoped to `user_id` + active `organization_id`.
- **New projects:** `organization_id` set from the active org on create.
- **Org switcher:** Sidebar org switcher; hub at **`/dashboard/organizations`** (members, teams, invitations, roles, settings, timeline).
- **Legacy org settings path:** `/dashboard/settings/organization` may remain for compatibility; prefer the Organizations module for admin tasks.

---

## Rollback

1. Set both org env vars to `false` and redeploy (API falls back to `user_id` only).
2. DB columns can remain; they are ignored while flags are off.

---

## Verification checklist

- [ ] All projects visible in active org after enabling flags
- [ ] Env vars still decrypt/create
- [ ] Org switcher lists workspace(s)
- [ ] New project attaches to active org
- [ ] Members/invites on organization settings load
