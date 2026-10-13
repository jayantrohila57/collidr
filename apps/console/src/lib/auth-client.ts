import { createEnvManagerAuthClient } from "@env-manager/auth-client";
import { DEFAULT_AUTH_URL } from "@env-manager/env/platform";
import { resolvePublicServiceUrl } from "@env-manager/env/vercel-services";

const authBaseUrl =
  process.env.NEXT_PUBLIC_AUTH_URL?.replace(/\/$/, "") ??
  (process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("auth")
    : DEFAULT_AUTH_URL);

export const authClient = createEnvManagerAuthClient({
  baseURL: authBaseUrl,
  organizationsEnabled: false,
  adminEnabled: true,
});
