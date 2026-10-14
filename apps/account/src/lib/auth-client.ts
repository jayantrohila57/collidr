import { createLoftlancerAuthClient } from "@loftlancer/auth-client";
import { DEFAULT_AUTH_URL } from "@loftlancer/env/platform";
import { resolvePublicServiceUrl } from "@loftlancer/env/vercel-services";

const authBaseURL =
  process.env.NEXT_PUBLIC_AUTH_URL?.replace(/\/$/, "") ??
  (process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("auth")
    : DEFAULT_AUTH_URL);

export const authClient = createLoftlancerAuthClient({
  baseURL: authBaseURL,
  organizationsEnabled:
    process.env.NEXT_PUBLIC_ORGANIZATIONS_ENABLED === "true",
});
