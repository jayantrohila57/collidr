import { createEnvManagerAuthClient } from "@env-manager/auth-client";
import { isOrganizationsEnabled } from "@env-manager/env/organizations";

export const authClient = createEnvManagerAuthClient({
  organizationsEnabled: isOrganizationsEnabled(),
  platformOAuth: true,
});
