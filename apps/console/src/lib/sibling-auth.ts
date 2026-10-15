import { createSiblingAuth } from "@loftlancer/auth/sibling-auth";
import { resolvePublicServiceUrl } from "@loftlancer/env/vercel-services";
import { DEFAULT_CONSOLE_URL } from "@loftlancer/env/platform";

const consoleOrigin =
  process.env.NEXT_PUBLIC_CONSOLE_URL?.replace(/\/$/, "") ??
  (process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("console")
    : DEFAULT_CONSOLE_URL);

export const siblingAuth = createSiblingAuth({
  baseURL: consoleOrigin,
});
