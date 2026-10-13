import { createSiblingAuth } from "@env-manager/auth/sibling-auth";
import { env } from "@env-manager/env/server";

export const siblingAuth = createSiblingAuth({
  baseURL: env.BETTER_AUTH_URL,
});
