import type { ActionName } from "@env-manager/actions";
import { runWithMcpAuditContext } from "../mcp-audit-context";
import { executeMcpAction, type McpToolContext } from "./handlers";

export async function runMcpTool(options: {
  action: ActionName;
  toolName: string;
  input: unknown;
  userId: string;
  oauthClientId: string | null;
}): Promise<unknown> {
  const ctx: McpToolContext = {
    userId: options.userId,
    oauthClientId: options.oauthClientId,
    toolName: options.toolName,
  };
  return runWithMcpAuditContext(
    {
      source: "mcp",
      oauthClientId: options.oauthClientId,
      mcpTool: options.toolName,
    },
    () => executeMcpAction(options.action, options.input, ctx),
  );
}
