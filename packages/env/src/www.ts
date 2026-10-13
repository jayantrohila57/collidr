import { createEnv } from "@t3-oss/env-nextjs";

import {
  platformUrlRuntimeEnv,
  platformUrlSchema,
} from "./platform";

export const env = createEnv({
  client: platformUrlSchema,
  runtimeEnv: platformUrlRuntimeEnv,
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});
