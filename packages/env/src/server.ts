import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v3";

import { encryptionKeySchema } from "./encryption-key-schema";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    /** Neon pooler URL; when set, used instead of DATABASE_URL for the pg pool. */
    DATABASE_URL_POOLED: z.string().min(1).optional(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    /** Comma-separated allowed browser origins (studio, console, docs, mcp, …). */
    CORS_ORIGIN: z.string().min(1),
    ENCRYPTION_KEY: encryptionKeySchema,
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    /** Set to "true" only after DB migration 0004 + schema patch (see docs/ORGANIZATION_MIGRATION.md) */
    ORGANIZATIONS_ENABLED: z
      .enum(["true", "false"])
      .default("false")
      .optional(),
    /** Enable after DB migration 0005 (see docs/PLATFORM_MIGRATION_0005.md) */
    NOTIFICATIONS_ENABLED: z
      .enum(["true", "false"])
      .default("false")
      .optional(),
    /** Enable after DB migration 0005 variables section */
    VARIABLES_V2_ENABLED: z.enum(["true", "false"]).default("false").optional(),
    /** Enable after DB migration 0006 (see docs/PLATFORM_MIGRATION_0006.md) */
    ACTIONS_AUDIT_ENABLED: z
      .enum(["true", "false"])
      .default("false")
      .optional(),
    /** Enable after soft-delete columns are applied (see docs/SOFT_DELETES.md) */
    SOFT_DELETES_ENABLED: z.enum(["true", "false"]).default("false").optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});
