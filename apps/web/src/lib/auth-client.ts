import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

export const authClient = createAuthClient({
  plugins: isOrganizationsEnabledOnClient() ? [organizationClient()] : [],
});
