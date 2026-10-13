export { auth } from "./auth";
export { createPlatformAuth } from "./create-platform-auth";
export { createSiblingAuth } from "./create-sibling-auth";
export type { CreateSiblingAuthOptions } from "./create-sibling-auth";
export {
  appendOttToUrl,
  isCrossOriginReturnTo,
  readOttFromSearchParams,
  stripOttFromPath,
} from "./cross-app-session";
export {
  platformSessionMiddleware,
  type PlatformMiddlewareOptions,
} from "./platform-middleware";
export {
  absoluteReturnToFromRelativePath,
  validateReturnTo,
} from "./return-to";
export {
  DEFAULT_ACCOUNT_URL,
  DEFAULT_AUTH_URL,
  DEFAULT_MCP_URL,
  DEFAULT_STUDIO_URL,
  DEFAULT_WWW_URL,
  getPlatformProductionOrigins,
} from "./platform-urls";
export type { AuthSession } from "./session-types";
export { getSessionActiveOrganizationId } from "./session-types";
