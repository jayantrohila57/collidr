export { auth } from "./auth";
export { createPlatformAuth } from "./create-platform-auth";
export type { CreateSiblingAuthOptions } from "./create-sibling-auth";
export { createSiblingAuth } from "./create-sibling-auth";
export {
  appendOttToUrl,
  isCrossOriginReturnTo,
  readOttFromSearchParams,
  stripOttFromPath,
} from "./cross-app-session";
export {
  evaluateSessionAccess,
  resolveSignInRedirect,
  type SessionAccessResult,
} from "./guards";
export {
  type PlatformMiddlewareOptions,
  platformSessionMiddleware,
} from "./platform-middleware";
export {
  DEFAULT_ACCOUNT_URL,
  DEFAULT_AUTH_URL,
  DEFAULT_MCP_URL,
  DEFAULT_STUDIO_URL,
  DEFAULT_WWW_URL,
  getPlatformProductionOrigins,
} from "./platform-urls";
export {
  absoluteReturnToFromRelativePath,
  validateReturnTo,
} from "./return-to";
export type { AuthSession } from "./session-types";
export { getSessionActiveOrganizationId } from "./session-types";
