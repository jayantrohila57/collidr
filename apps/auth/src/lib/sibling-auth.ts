import { createSiblingAuth } from "@loftlancer/auth/sibling-auth";
import { resolvePublicServiceUrl } from "@loftlancer/env/vercel-services";

export const siblingAuth = createSiblingAuth({
  baseURL: resolvePublicServiceUrl("auth"),
});
