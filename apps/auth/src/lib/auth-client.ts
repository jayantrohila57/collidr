import { createEnvManagerAuthClient } from "@env-manager/auth-client";
import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import { resolvePublicServiceUrl } from "@env-manager/env/vercel-services";

export const authClient = createEnvManagerAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_AUTH_URL?.replace(/\/$/, "") ??
    (process.env.VERCEL_SERVICES === "1"
      ? resolvePublicServiceUrl("auth")
      : undefined),
  organizationsEnabled: isOrganizationsEnabled(),
  platformOAuth: true,
});
