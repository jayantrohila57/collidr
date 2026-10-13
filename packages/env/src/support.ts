import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v3";

import { productAppClientSchema, productAppRuntimeEnv } from "./platform";

export const DEFAULT_SUPPORT_URL = "https://collidr.vercel.app/support";

/** Client env for `apps/support`. */
export const supportEnv = createEnv({
  client: {
    ...productAppClientSchema,
    NEXT_PUBLIC_SUPPORT_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    ...productAppRuntimeEnv,
    NEXT_PUBLIC_SUPPORT_URL: process.env.NEXT_PUBLIC_SUPPORT_URL,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});
