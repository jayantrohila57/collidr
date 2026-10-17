import { createMcpProtectedRequestHandler } from "@better-auth/mcp";
import { resolveAuthServiceUrl } from "@loftlancer/env/vercel-services";
import type { JWTPayload } from "jose";

import {
  MCP_BASE_SCOPE,
  parseGrantedScopes,
  requiredOAuthScopesForAction,
  tokenHasScopes,
} from "./scopes";

export type McpResourceAuthConfig = {
  issuer: string;
  audience: string;
  jwksUrl: string;
};

export function resolveMcpResourceAuthConfig(): McpResourceAuthConfig {
  const authUrl = (
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_AUTH_URL ??
    resolveAuthServiceUrl()
  ).replace(/\/$/, "");

  const audience = (
    process.env.MCP_RESOURCE_URL ??
    process.env.NEXT_PUBLIC_MCP_URL ??
    "https://loftlancer.com"
  ).replace(/\/$/, "");
  const resource = audience.endsWith("/api/mcp")
    ? audience
    : `${audience}/api/mcp`;

  return {
    issuer: authUrl,
    audience: resource,
    jwksUrl: `${authUrl}/api/auth/jwks`,
  };
}

export function createMcpResourceHandler(
  handler: (request: Request, claims: JWTPayload) => Promise<Response>,
  options?: { requiredScopes?: readonly string[] },
) {
  const config = resolveMcpResourceAuthConfig();
  return createMcpProtectedRequestHandler(
    {
      issuer: config.issuer,
      audience: config.audience,
      jwksUrl: config.jwksUrl,
      requiredScopes: options?.requiredScopes ?? [MCP_BASE_SCOPE],
    },
    handler,
  );
}

export function assertTokenScopesForAction(
  claims: JWTPayload,
  action: Parameters<typeof requiredOAuthScopesForAction>[0],
): void {
  const granted = parseGrantedScopes(claims.scope);
  const required = requiredOAuthScopesForAction(action);
  if (!tokenHasScopes(granted, required)) {
    throw new McpInsufficientScopeError(
      required.filter((scope) => !granted.has(scope)),
    );
  }
}

export class McpInsufficientScopeError extends Error {
  readonly missingScopes: string[];

  constructor(missingScopes: string[]) {
    super(`insufficient_scope: ${missingScopes.join(" ")}`);
    this.name = "McpInsufficientScopeError";
    this.missingScopes = missingScopes;
  }
}

export function getUserIdFromClaims(claims: JWTPayload): string {
  const sub = claims.sub;
  if (!sub || typeof sub !== "string") {
    throw new Error("invalid_token: missing sub");
  }
  return sub;
}

export function getOAuthClientIdFromClaims(claims: JWTPayload): string | null {
  const clientId = claims.client_id ?? claims.azp;
  return typeof clientId === "string" ? clientId : null;
}
