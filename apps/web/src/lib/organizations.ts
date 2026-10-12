import { env } from "@env-manager/env/web";

export function isOrganizationsEnabledOnClient(): boolean {
  return env.NEXT_PUBLIC_ORGANIZATIONS_ENABLED === "true";
}
