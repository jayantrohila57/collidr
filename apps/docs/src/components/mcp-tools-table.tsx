import { actionRegistry } from "@env-manager/actions";

const MCP_SCOPES_BY_PREFIX: Record<string, string> = {
  platform: "platform:admin",
  organization: "organizations:read",
  project: "projects:read",
  environment: "projects:read",
  variable: "variables:read",
  audit: "audit:read",
  notification: "notifications:read",
  team: "organizations:read",
  invitation: "organizations:read",
  user: "account:read",
};

function inferScope(actionName: string): string {
  const prefix = actionName.split(".")[0] ?? "other";
  if (actionName.includes("reveal")) return "variables:reveal";
  if (actionName.includes("export")) return "variables:export";
  if (actionName.includes("impersonate")) return "platform:admin";
  return MCP_SCOPES_BY_PREFIX[prefix] ?? "—";
}

export function McpToolsTable() {
  const rows = Object.values(actionRegistry)
    .filter((action) => action.scope !== "platform")
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="not-prose my-6 overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            <th className="px-4 py-2 font-medium">MCP tool (planned)</th>
            <th className="px-4 py-2 font-medium">Canonical action</th>
            <th className="px-4 py-2 font-medium">Scope (indicative)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((action) => {
            const toolName = action.name.replaceAll(".", "_");
            return (
              <tr className="border-b last:border-0" key={action.name}>
                <td className="px-4 py-2 font-mono text-xs">{toolName}</td>
                <td className="px-4 py-2 font-mono text-xs">{action.name}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {inferScope(action.name)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t px-4 py-3 text-muted-foreground text-xs">
        Console and account-only operations are not exposed via MCP. Full OAuth
        scope matrix ships with{" "}
        <code className="text-foreground">apps/mcp</code> (see platform plan).
      </p>
    </div>
  );
}
