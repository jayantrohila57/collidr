import { orgAc, orgBetterAuthRoles } from "@env-manager/actions";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export type CreateEnvManagerAuthClientOptions = {
  /** Auth app origin when the client runs on a sibling app (e.g. studio). Omit on same host as `/api/auth`. */
  baseURL?: string;
  organizationsEnabled?: boolean;
};

export function createEnvManagerAuthClient(
  options: CreateEnvManagerAuthClientOptions = {},
) {
  const { baseURL, organizationsEnabled = false } = options;

  return createAuthClient({
    ...(baseURL ? { baseURL } : {}),
    plugins: organizationsEnabled
      ? [
          organizationClient({
            ac: orgAc,
            roles: orgBetterAuthRoles,
          }),
        ]
      : [],
  });
}
