# Variables v2 — database migration

Migration tag: **`0005_variable_provenance_and_type`**

File: `packages/db/src/migrations/0005_variable_provenance_and_type.sql`

Do **not** run this against production until you have reviewed and approved it. Enable the feature only after the migration succeeds on that database.

## What changes

| Table | Column | Type | Default / backfill |
|-------|--------|------|-------------------|
| `environment_variable` | `type` | `environment_variable_type` enum (`secret`, `config`) | `NOT NULL DEFAULT 'secret'` — **all existing rows become `secret`** |
| `environment_variable` | `note` | `text` | `NULL` |
| `environment_variable` | `created_by` | `text` → `user.id` | Backfilled from **`project.user_id`** via `environment` → `project` |
| `environment_variable` | `updated_by` | `text` → `user.id` | Same backfill as `created_by` |
| `environment` | `created_by` | `text` → `user.id` | Backfilled from **`project.user_id`** |
| `environment` | `updated_by` | `text` → `user.id` | Same backfill as `created_by` |

Rationale for backfill: historical rows have no actor metadata; attributing them to the **project owner** (`project.user_id`) is a conservative default for display (“Added by …”) until real edits occur.

## Exact SQL (generated)

```sql
CREATE TYPE "public"."environment_variable_type" AS ENUM('secret', 'config');

ALTER TABLE "environment" ADD COLUMN "created_by" text;
ALTER TABLE "environment" ADD COLUMN "updated_by" text;

ALTER TABLE "environment_variable" ADD COLUMN "type" "environment_variable_type" DEFAULT 'secret' NOT NULL;
ALTER TABLE "environment_variable" ADD COLUMN "note" text;
ALTER TABLE "environment_variable" ADD COLUMN "created_by" text;
ALTER TABLE "environment_variable" ADD COLUMN "updated_by" text;

ALTER TABLE "environment" ADD CONSTRAINT "environment_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "environment" ADD CONSTRAINT "environment_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "environment_variable" ADD CONSTRAINT "environment_variable_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "environment_variable" ADD CONSTRAINT "environment_variable_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;

UPDATE "environment" AS e
SET
  "created_by" = p."user_id",
  "updated_by" = p."user_id"
FROM "project" AS p
WHERE e."project_id" = p."id"
  AND (e."created_by" IS NULL OR e."updated_by" IS NULL);

UPDATE "environment_variable" AS ev
SET
  "created_by" = p."user_id",
  "updated_by" = p."user_id"
FROM "environment" AS e
INNER JOIN "project" AS p ON e."project_id" = p."id"
WHERE ev."environment_id" = e."id"
  AND (ev."created_by" IS NULL OR ev."updated_by" IS NULL);
```

## Apply locally or on a Neon branch

1. Create a Neon branch (recommended) or use a local Postgres database.
2. Point `DATABASE_URL` at that database.
3. From the repo root:

   ```bash
   pnpm db:migrate
   ```

4. Set feature flags (both required for the new UI and API paths):

   ```bash
   VARIABLES_V2_ENABLED=true
   NEXT_PUBLIC_VARIABLES_V2_ENABLED=true
   ```

5. Restart the web app and API.

## Production rollout (manual)

1. Run migration `0005` on production (after approval).
2. Set `VARIABLES_V2_ENABLED=true` on the server environment.
3. Rebuild/deploy the web app with `NEXT_PUBLIC_VARIABLES_V2_ENABLED=true`.
4. Merge the Variables v2 application branch into `main` only after step 1 is complete.

Until the migration runs, keep both flags **`false`**. API and UI stay on the legacy add sheet and omit v2 columns in SQL.

## Feature behavior when enabled

- **Secret**: value cannot be fetched via `environmentVariables.get` after save; UI shows “Hidden” and allows overwrite only.
- **Config**: reveal and copy allowed.
- **Batch create**: multiple keys and multiple environments in one save (no `.env` import).
