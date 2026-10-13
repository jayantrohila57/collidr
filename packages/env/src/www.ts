import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v3";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_WWW_URL: z.string().url().optional(),
    NEXT_PUBLIC_AUTH_URL: z.string().url().optional(),
    NEXT_PUBLIC_STUDIO_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_WWW_URL: process.env.NEXT_PUBLIC_WWW_URL,
    NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
    NEXT_PUBLIC_STUDIO_URL: process.env.NEXT_PUBLIC_STUDIO_URL,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});
