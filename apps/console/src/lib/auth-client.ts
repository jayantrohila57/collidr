import { createLoftlancerAuthClient } from "@loftlancer/auth-client";

/** Same-origin `/api/auth` (sibling session cookies on the console host). */
export const authClient = createLoftlancerAuthClient({
  organizationsEnabled: false,
  adminEnabled: true,
});
