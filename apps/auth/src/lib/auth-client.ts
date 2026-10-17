import { createLoftlancerAuthClient } from "@loftlancer/auth-client";
import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import { resolvePublicServiceUrl } from "@loftlancer/env/vercel-services";

export const authClient = createLoftlancerAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_AUTH_URL?.replace(/\/$/, "") ??
    (process.env.VERCEL_SERVICES === "1"
      ? resolvePublicServiceUrl("auth")
      : undefined),
  organizationsEnabled: isOrganizationsEnabled(),
  platformOAuth: true,
});
