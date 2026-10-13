import { createEnvManagerAuthClient } from "@env-manager/auth-client";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

export const authClient = createEnvManagerAuthClient({
  organizationsEnabled: isOrganizationsEnabledOnClient(),
});
