import { createEnvManagerAuthClient } from "@env-manager/auth-client";

const authBaseUrl = process.env.NEXT_PUBLIC_AUTH_URL;

export const authClient = createEnvManagerAuthClient({
  ...(authBaseUrl ? { baseURL: authBaseUrl } : {}),
  organizationsEnabled: false,
  adminEnabled: true,
});
