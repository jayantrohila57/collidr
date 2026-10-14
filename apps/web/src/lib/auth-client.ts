import { createLoftlancerAuthClient } from "@loftlancer/auth-client";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

export const authClient = createLoftlancerAuthClient({
  organizationsEnabled: isOrganizationsEnabledOnClient(),
});
