import { env } from "@loftlancer/env/web";

export function isOrganizationsEnabledOnClient(): boolean {
  return env.NEXT_PUBLIC_ORGANIZATIONS_ENABLED === "true";
}
