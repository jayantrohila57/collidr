# Platform migration `0005` (variables v2 + notifications)

**Do not run against production until you explicitly approve.** Apply on a local Postgres or Neon branch first, then enable feature flags.

## Feature flags (after migration)

Server (`.env`):

```env
VARIABLES_V2_ENABLED=true
NOTIFICATIONS_ENABLED=true
```

Client (inlined at build):

```env
NEXT_PUBLIC_VARIABLES_V2_ENABLED=true
NEXT_PUBLIC_NOTIFICATIONS_ENABLED=true
```

Defaults are `false` until migration is applied.

## Variables v2 defaults

| Column / change | Default for existing rows |
|-----------------|---------------------------|
| `environment_variable.type` | `'secret'` (`NOT NULL DEFAULT 'secret'`) |
| `environment.created_by`, `environment.updated_by` | Project owner (`project.user_id`) |
| `environment_variable.created_by`, `environment_variable.updated_by` | Project owner via environment → project join |

## Notifications schema

- Table `notification` with polymorphic `entity_type` / `entity_id`, typed `data` jsonb, optional denormalized `title` / `body`, `read_at`, optional `idempotency_key`.
- Pre-signup invites: `recipient_email` when no user exists; linked to `recipient_user_id` on first session (`linkPendingNotificationsForUser`).
- Indexes: `(recipient_user_id, read_at, created_at DESC)`, `recipient_email`, partial unique idempotency per user/email.

## Full SQL (`0005_platform_variables_and_notifications.sql`)

```sql
-- Combined platform migration (approve once for prod):
-- Part A: Variables v2 (type, note, provenance)
-- Part B: Notifications

-- --- Part A: Variables v2 ---
-- Defaults: existing rows -> type 'secret'; created_by/updated_by -> project owner (user_id).

CREATE TYPE "public"."environment_variable_type" AS ENUM('secret', 'config');
ALTER TABLE "environment" ADD COLUMN IF NOT EXISTS "created_by" text;
ALTER TABLE "environment" ADD COLUMN IF NOT EXISTS "updated_by" text;
ALTER TABLE "environment_variable" ADD COLUMN IF NOT EXISTS "type" "environment_variable_type" DEFAULT 'secret' NOT NULL;
ALTER TABLE "environment_variable" ADD COLUMN IF NOT EXISTS "note" text;
ALTER TABLE "environment_variable" ADD COLUMN IF NOT EXISTS "created_by" text;
ALTER TABLE "environment_variable" ADD COLUMN IF NOT EXISTS "updated_by" text;
DO $$ BEGIN
  ALTER TABLE "environment" ADD CONSTRAINT "environment_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "environment" ADD CONSTRAINT "environment_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "environment_variable" ADD CONSTRAINT "environment_variable_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "environment_variable" ADD CONSTRAINT "environment_variable_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
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

-- --- Part B: Notifications ---
CREATE TABLE IF NOT EXISTS "notification" (
  "id" text PRIMARY KEY NOT NULL,
  "recipient_user_id" text,
  "recipient_email" text,
  "organization_id" text,
  "type" text NOT NULL,
  "actor_user_id" text,
  "entity_type" text,
  "entity_id" text,
  "data" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "title" text,
  "body" text,
  "read_at" timestamp,
  "idempotency_key" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "notification_recipient_user_id_user_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "notification_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "notification_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action
);
CREATE INDEX IF NOT EXISTS "notification_recipient_user_read_created_idx" ON "notification" ("recipient_user_id", "read_at", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "notification_recipient_email_idx" ON "notification" ("recipient_email");
CREATE UNIQUE INDEX IF NOT EXISTS "notification_user_idempotency_uidx" ON "notification" ("recipient_user_id", "idempotency_key") WHERE "idempotency_key" IS NOT NULL AND "recipient_user_id" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "notification_email_idempotency_uidx" ON "notification" ("recipient_email", "idempotency_key") WHERE "idempotency_key" IS NOT NULL AND "recipient_email" IS NOT NULL;
```

## Apply locally

```bash
pnpm --filter @env-manager/db db:migrate
```

## E2E (local only)

With `E2E_TEST_MODE=1`, `NOTIFICATIONS_ENABLED=true`, `ORGANIZATIONS_ENABLED=true`, and migration applied:

```bash
cd apps/web && pnpm exec playwright test e2e/notifications-invitation.spec.ts
```

Uses `/api/e2e/notifications/prepare` and `/api/e2e/login` personas — no real prod email invites.
