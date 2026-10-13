import { createSiblingAuth } from "@env-manager/auth/sibling-auth";
import { resolvePublicServiceUrl } from "@env-manager/env/vercel-services";

export const siblingAuth = createSiblingAuth({
  baseURL: resolvePublicServiceUrl("account"),
});
