import { createEnvManagerAuthClient } from "@env-manager/auth-client";
import { DEFAULT_AUTH_URL } from "@env-manager/env/platform";

const authBaseURL =
  process.env.NEXT_PUBLIC_AUTH_URL?.replace(/\/$/, "") ?? DEFAULT_AUTH_URL;

export const authClient = createEnvManagerAuthClient({
  baseURL: authBaseURL,
  organizationsEnabled:
    process.env.NEXT_PUBLIC_ORGANIZATIONS_ENABLED === "true",
});
