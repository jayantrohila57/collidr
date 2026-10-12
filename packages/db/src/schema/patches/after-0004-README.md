# Drizzle schema patch after migration 0004

Apply **after** running `0004_organizations.sql` and the backfill script.

## 1. `packages/db/src/schema/auth.ts` — session

Add to `session` table columns:

```ts
activeOrganizationId: text("active_organization_id"),
```

## 2. `packages/db/src/schema/projects.ts` — project

Add to `project` table columns:

```ts
organizationId: text("organization_id").references(() => organization.id, {
  onDelete: "set null",
}),
```

Import `organization` from `./organization` and add index:

```ts
index("project_organizationId_idx").on(table.organizationId),
```

## 3. Redeploy, then set `ORGANIZATIONS_ENABLED=true`

See `docs/ORGANIZATION_MIGRATION.md`.
