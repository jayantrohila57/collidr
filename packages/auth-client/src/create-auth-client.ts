import { orgAc, orgBetterAuthRoles } from "@env-manager/actions";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export type CreateEnvManagerAuthClientOptions = {
  /** Auth app origin when the client runs on a sibling app (e.g. studio). Omit on same host as `/api/auth`. */
  baseURL?: string;
  organizationsEnabled?: boolean;
  /** Better Auth admin plugin (console impersonation, role management). */
  adminEnabled?: boolean;
};

export function createEnvManagerAuthClient(
  options: CreateEnvManagerAuthClientOptions = {},
) {
  const {
    baseURL,
    organizationsEnabled = false,
    adminEnabled = true,
  } = options;

  const plugins = [];
  if (adminEnabled) {
    plugins.push(adminClient());
  }
  if (organizationsEnabled) {
    plugins.push(
      organizationClient({
        ac: orgAc,
        roles: orgBetterAuthRoles,
      }),
    );
  }

  return createAuthClient({
    ...(baseURL ? { baseURL } : {}),
    plugins,
  });
}
