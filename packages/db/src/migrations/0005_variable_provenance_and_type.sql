-- Variables v2: type, note, provenance; environment provenance.
-- Defaults: existing rows -> type 'secret'; created_by/updated_by -> project owner.

CREATE TYPE "public"."environment_variable_type" AS ENUM('secret', 'config');--> statement-breakpoint
ALTER TABLE "environment" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "environment" ADD COLUMN "updated_by" text;--> statement-breakpoint
ALTER TABLE "environment_variable" ADD COLUMN "type" "environment_variable_type" DEFAULT 'secret' NOT NULL;--> statement-breakpoint
ALTER TABLE "environment_variable" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "environment_variable" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "environment_variable" ADD COLUMN "updated_by" text;--> statement-breakpoint
ALTER TABLE "environment" ADD CONSTRAINT "environment_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environment" ADD CONSTRAINT "environment_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environment_variable" ADD CONSTRAINT "environment_variable_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environment_variable" ADD CONSTRAINT "environment_variable_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
UPDATE "environment" AS e
SET
  "created_by" = p."user_id",
  "updated_by" = p."user_id"
FROM "project" AS p
WHERE e."project_id" = p."id"
  AND (e."created_by" IS NULL OR e."updated_by" IS NULL);--> statement-breakpoint
UPDATE "environment_variable" AS ev
SET
  "created_by" = p."user_id",
  "updated_by" = p."user_id"
FROM "environment" AS e
INNER JOIN "project" AS p ON e."project_id" = p."id"
WHERE ev."environment_id" = e."id"
  AND (ev."created_by" IS NULL OR ev."updated_by" IS NULL);
