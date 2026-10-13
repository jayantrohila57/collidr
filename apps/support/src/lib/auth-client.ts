import { createCollidrAuthClient } from "@collidr/auth-client";

const authBaseUrl = process.env.NEXT_PUBLIC_AUTH_URL;

export const authClient = createCollidrAuthClient({
  ...(authBaseUrl ? { baseURL: authBaseUrl } : {}),
  organizationsEnabled: false,
  adminEnabled: false,
});
