import { createCollidrAuthClient } from "@collidr/auth-client";
import { DEFAULT_AUTH_URL } from "@collidr/env/platform";
import { resolvePublicServiceUrl } from "@collidr/env/vercel-services";

const authBaseUrl =
  process.env.NEXT_PUBLIC_AUTH_URL?.replace(/\/$/, "") ??
  (process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("auth")
    : DEFAULT_AUTH_URL);

export const authClient = createCollidrAuthClient({
  baseURL: authBaseUrl,
  organizationsEnabled: false,
  adminEnabled: true,
});
