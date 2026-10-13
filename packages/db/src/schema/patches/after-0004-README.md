# Drizzle schema patch after migration 0004

**Status:** Applied in `auth.ts` and `projects.ts` (session `activeOrganizationId`, project `organizationId` + `project_organization_id_idx`).

Historical reference for what was added:

- `session.activeOrganizationId` → column `active_organization_id`
- `project.organizationId` → FK to `organization` with `onDelete: "set null"`
- Index name **`project_organization_id_idx`** (matches `0004_organizations.sql`)

Production schema is kept in sync via **`drizzle-kit push`** — see `packages/db/DATABASE.md`. Platform-wide SQL bundles and reset-seed: `docs/PLATFORM_MIGRATION_COMBINED.md`, `docs/DB_RESET.md`.
