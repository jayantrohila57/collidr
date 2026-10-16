import { createLoftlancerAuthClient } from "@loftlancer/auth-client";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

/** Studio sibling auth at `<studio URL>/api/auth` (e.g. https://loftlancer.com/studio/api/auth). */
export const authClient = createLoftlancerAuthClient({
  baseURL: process.env.NEXT_PUBLIC_STUDIO_URL?.replace(/\/$/, ""),
  organizationsEnabled: isOrganizationsEnabledOnClient(),
});
