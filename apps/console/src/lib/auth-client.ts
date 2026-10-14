import { createCollidrAuthClient } from "@collidr/auth-client";

/** Same-origin `/api/auth` (sibling session cookies on the console host). */
export const authClient = createCollidrAuthClient({
  organizationsEnabled: false,
  adminEnabled: true,
});
