import { createCollidrAuthClient } from "@collidr/auth-client";
import { isOrganizationsEnabled } from "@collidr/env/organizations";
import { resolvePublicServiceUrl } from "@collidr/env/vercel-services";

export const authClient = createCollidrAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_AUTH_URL?.replace(/\/$/, "") ??
    (process.env.VERCEL_SERVICES === "1"
      ? resolvePublicServiceUrl("auth")
      : undefined),
  organizationsEnabled: isOrganizationsEnabled(),
  platformOAuth: true,
});
