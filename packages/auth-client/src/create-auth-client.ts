import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { orgAc, orgBetterAuthRoles } from "@loftlancer/actions";
import {
  adminClient,
  deviceAuthorizationClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export type CreateLoftlancerAuthClientOptions = {
  /** Auth app origin when the client runs on a sibling app (e.g. studio). Omit on same host as `/api/auth`. */
  baseURL?: string;
  organizationsEnabled?: boolean;
  /** Better Auth admin plugin (console impersonation, role management). */
  adminEnabled?: boolean;
  /** OAuth provider + device authorization (apps/auth consent and /device UI). */
  platformOAuth?: boolean;
};

export function createLoftlancerAuthClient(
  options: CreateLoftlancerAuthClientOptions = {},
) {
  const {
    baseURL,
    organizationsEnabled = false,
    adminEnabled = true,
    platformOAuth = false,
  } = options;

  const plugins = [];
  if (adminEnabled) {
    plugins.push(adminClient());
  }
  if (platformOAuth) {
    plugins.push(oauthProviderClient(), deviceAuthorizationClient());
  }
  if (organizationsEnabled) {
    plugins.push(
      organizationClient({
        ac: orgAc,
        roles: orgBetterAuthRoles,
      }),
    );
  }

  // Better Auth treats any path in baseURL as the full API path, so point it at
  // `<auth app URL>/api/auth` (e.g. https://loftlancer.com/auth/api/auth).
  const apiBaseURL = baseURL
    ? baseURL.replace(/\/$/, "").endsWith("/api/auth")
      ? baseURL.replace(/\/$/, "")
      : `${baseURL.replace(/\/$/, "")}/api/auth`
    : undefined;

  return createAuthClient({
    ...(apiBaseURL ? { baseURL: apiBaseURL } : {}),
    plugins,
  });
}
