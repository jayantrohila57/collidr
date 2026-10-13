import { type ActionName, actionRegistry } from "@env-manager/actions";
import { requireAction } from "@env-manager/api/actions/require-action";
import type { McpServer } from "@modelcontextprotocol/server";
import type { JWTPayload } from "jose";
import { z } from "zod";
import { consumeRateLimit, mcpRateLimitKey } from "../rate-limit";
import {
  assertTokenScopesForAction,
  getOAuthClientIdFromClaims,
  getUserIdFromClaims,
} from "../resource-auth";
import {
  actionFromMcpToolName,
  mcpToolNameFromAction,
  parseGrantedScopes,
  requiredOAuthScopesForAction,
} from "../scopes";

const EXCLUDED_SCOPES = new Set<ActionName>([
  "platform.user.list",
  "platform.user.set_role",
  "platform.user.impersonate",
]);

function listMcpActions(): ActionName[] {
  return Object.values(actionRegistry)
    .map((def) => def.name as ActionName)
    .filter((name) => !name.startsWith("platform."))
    .filter((name) => !name.startsWith("user."))
    .filter((name) => !EXCLUDED_SCOPES.has(name))
    .sort();
}

async function runWithMcpGates(
  claims: JWTPayload,
  toolName: string,
  action: ActionName,
  run: (ctx: {
    userId: string;
    oauthClientId: string | null;
  }) => Promise<Record<string, unknown>>,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const userId = getUserIdFromClaims(claims);
  const oauthClientId = getOAuthClientIdFromClaims(claims);

  const limit = await consumeRateLimit(
    mcpRateLimitKey({ oauthClientId, userId, toolName }),
  );
  if (!limit.allowed) {
    throw new Error(
      `rate_limit_exceeded: retry after ${limit.retryAfterSeconds}s`,
    );
  }

  assertTokenScopesForAction(claims, action);

  await requireAction(action, { userId });

  const result = await run({ userId, oauthClientId });
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
      if (!granted.has("mcp:tools")) {
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
        description: `MCP stub for ${action} — full handlers ship in P8 (#102).`,
        inputSchema: emptyInput,
      },
      async () => {
        return runWithMcpGates(claims, toolName, action, async () => ({
          status: "not_implemented",
          action,
          message:
            "Tool wiring is registered; service implementation is tracked in platform P8.",
        }));
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
