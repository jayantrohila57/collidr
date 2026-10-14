import { type ActionName, actionRegistry } from "@loftlancer/actions";
import { listMcpExposedActions, runMcpTool } from "@loftlancer/api/mcp";
import type { McpServer } from "@modelcontextprotocol/server";
import type { JWTPayload } from "jose";
import { z } from "zod";
import {
  consumeRateLimit,
  mcpRateLimitKey,
  resolveMcpRateLimitConfig,
} from "../rate-limit";
import {
  assertTokenScopesForAction,
  getOAuthClientIdFromClaims,
  getUserIdFromClaims,
} from "../resource-auth";
import {
  actionFromMcpToolName,
  MCP_BASE_SCOPE,
  mcpToolNameFromAction,
  parseGrantedScopes,
  requiredOAuthScopesForAction,
} from "../scopes";

function listMcpActions(): ActionName[] {
  return listMcpExposedActions();
}

/** Tool args validated in `@loftlancer/api/mcp` (Zod v3 handler schemas). */
const mcpToolInputSchema = z.object({}).passthrough();

async function runWithMcpGates(
  claims: JWTPayload,
  toolName: string,
  action: ActionName,
  input: Record<string, unknown>,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const userId = getUserIdFromClaims(claims);
  const oauthClientId = getOAuthClientIdFromClaims(claims);

  const limit = await consumeRateLimit(
    mcpRateLimitKey({ oauthClientId, userId, toolName }),
    resolveMcpRateLimitConfig(action),
  );
  if (!limit.allowed) {
    throw new Error(
      `rate_limit_exceeded: retry after ${limit.retryAfterSeconds}s`,
    );
  }

  assertTokenScopesForAction(claims, action);

  const result = await runMcpTool({
    action,
    toolName,
    input,
    userId,
    oauthClientId,
  });

  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}

export function registerMcpTools(server: McpServer, claims: JWTPayload): void {
  const emptyInput = z.object({});

  server.registerTool(
    "permissions_snapshot",
    {
      title: "Permissions snapshot",
      description:
        "Lists canonical actions exposed via MCP and the OAuth scopes required for each.",
      inputSchema: emptyInput,
    },
    async () => {
      const userId = getUserIdFromClaims(claims);
      const oauthClientId = getOAuthClientIdFromClaims(claims);
      const limit = await consumeRateLimit(
        mcpRateLimitKey({
          oauthClientId,
          userId,
          toolName: "permissions_snapshot",
        }),
      );
      if (!limit.allowed) {
        throw new Error(
          `rate_limit_exceeded: retry after ${limit.retryAfterSeconds}s`,
        );
      }
      const granted = parseGrantedScopes(claims.scope);
      if (!granted.has(MCP_BASE_SCOPE)) {
        throw new Error("insufficient_scope: mcp:tools");
      }
      const actions = listMcpActions();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                actions: actions.map((action) => ({
                  tool: mcpToolNameFromAction(action),
                  action,
                  scopes: requiredOAuthScopesForAction(action),
                  description: actionRegistry[action]?.description,
                })),
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  for (const action of listMcpActions()) {
    const toolName = mcpToolNameFromAction(action);
    if (toolName === "permissions_snapshot") continue;

    server.registerTool(
      toolName,
      {
        title: toolName,
        description:
          actionRegistry[action]?.description ??
          `Execute ${action} via Loftlancer MCP.`,
        inputSchema: mcpToolInputSchema,
      },
      async (input: Record<string, unknown>) => {
        const payload =
          input && typeof input === "object"
            ? (input as Record<string, unknown>)
            : {};
        return runWithMcpGates(claims, toolName, action, payload);
      },
    );
  }
}

export function resolveActionForTool(toolName: string): ActionName | null {
  if (toolName === "permissions_snapshot") {
    return "organization.list";
  }
  return actionFromMcpToolName(toolName);
}
