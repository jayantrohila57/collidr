import { createSiblingAuth } from "@collidr/auth/sibling-auth";
import { resolvePublicServiceUrl } from "@collidr/env/vercel-services";

export const siblingAuth = createSiblingAuth({
  baseURL: resolvePublicServiceUrl("auth"),
});
