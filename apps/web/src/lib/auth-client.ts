import { createCollidrAuthClient } from "@collidr/auth-client";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

export const authClient = createCollidrAuthClient({
  organizationsEnabled: isOrganizationsEnabledOnClient(),
});
