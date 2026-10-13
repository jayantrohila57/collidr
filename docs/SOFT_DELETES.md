# Soft deletes (app-wide)

User-facing deletes set `deleted_at` and `deleted_by` instead of removing rows. Reads exclude soft-deleted rows by default.

## Schema

Drizzle tables that support soft delete expose nullable:

- `deleted_at` (`timestamp`)
- `deleted_by` (`text`, FK → `user.id`, `ON DELETE SET NULL`)

Applied in schema for: `project`, `environment`, `environment_variable`, `organization`, `member`, `invitation`, and `notification`. (`user` stays hard-delete only for Better Auth compatibility.)

**Exceptions (hard delete only):** `session`, `account`, `verification`, and immutable `audit_log`.

Global unique constraints on slugs/emails are replaced with **partial unique indexes** `WHERE deleted_at IS NULL` so active rows stay unique while deleted rows retain history.

The permissions agent ships the **combined SQL migration** (see `docs/ACTIONS_PERMISSIONS_AUDIT.md` §9.8). Do not run `db:generate` / `db:migrate` from feature branches.

## Feature flag

```env
SOFT_DELETES_ENABLED=true
```

Default is **off**. When off:

- Queries do not reference `deleted_at` (production stays compatible pre-migration).
- Delete mutations perform **hard** `DELETE` (current behavior).

When on (after migration):

- `notDeleted()` / `active*Where()` helpers add `deleted_at IS NULL`.
- Delete mutations call `softDelete*ById` helpers (cascade soft-delete for project → environments → variables).

## Code helpers (`@env-manager/db`)

| Helper | Purpose |
|--------|---------|
| `notDeleted(column)` | `IS NULL` filter when flag on |
| `activeProjectWhere`, `activeEnvironmentWhere`, … | Scope queries to active rows |
| `environmentOwnedByUserWhere`, `variableOwnedByUserWhere` | Join-aware access checks |
| `softDeleteProjectById`, `softDeleteEnvironmentById`, `softDeleteEnvironmentVariableById` | User-facing deletes |

## Better Auth

Organization/member/invitation deletes initiated via Better Auth still use the adapter’s hard delete until the auth workstream wires soft-delete hooks. App-owned tRPC deletes and all list/get paths already respect the flag.

## Enabling in production

1. Apply the combined migration (adds columns + partial indexes).
2. Set `SOFT_DELETES_ENABLED=true` on the API/runtime.
3. Smoke-test project/environment/variable delete and list flows.
