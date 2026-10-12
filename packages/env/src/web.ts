import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v3";

export const env = createEnv({
  client: {
    /** Must match server ORGANIZATIONS_ENABLED; inlined at `next build` (see turbo.json globalEnv). */
    NEXT_PUBLIC_ORGANIZATIONS_ENABLED: z
      .enum(["true", "false"])
      .default("false")
      .optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_ORGANIZATIONS_ENABLED:
      process.env.NEXT_PUBLIC_ORGANIZATIONS_ENABLED,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});
