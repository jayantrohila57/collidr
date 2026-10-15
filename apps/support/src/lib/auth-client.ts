import { createLoftlancerAuthClient } from "@loftlancer/auth-client";

const authBaseUrl = process.env.NEXT_PUBLIC_AUTH_URL;

export const authClient = createLoftlancerAuthClient({
  ...(authBaseUrl ? { baseURL: authBaseUrl } : {}),
  organizationsEnabled: false,
  adminEnabled: false,
});
