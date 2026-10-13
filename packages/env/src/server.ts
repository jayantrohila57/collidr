import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v3";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    /** Neon pooler URL; when set, used instead of DATABASE_URL for the pg pool. */
    DATABASE_URL_POOLED: z.string().min(1).optional(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    CORS_ORIGIN: z.string().url(),
    ENCRYPTION_KEY: z.string(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    /** Set to "true" only after DB migration 0004 + schema patch (see docs/ORGANIZATION_MIGRATION.md) */
    ORGANIZATIONS_ENABLED: z
      .enum(["true", "false"])
      .default("false")
      .optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});
