import { createCollidrAuthClient } from "@collidr/auth-client";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

/** Same-origin `/api/auth` (sibling session cookies on the studio host). */
export const authClient = createCollidrAuthClient({
  organizationsEnabled: isOrganizationsEnabledOnClient(),
});
