import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mcpToolNameFromAction } from "@env-manager/actions";
import { resolveMcpRateLimitConfig } from "./rate-limit";

describe("MCP tools", () => {
  it("applies stricter rate limits for reveal and write verbs", () => {
    const read = resolveMcpRateLimitConfig("organization.list");
    const write = resolveMcpRateLimitConfig("project.create");
    const reveal = resolveMcpRateLimitConfig("variable.reveal");
    assert.ok(write.maxRequests <= read.maxRequests);
    assert.ok(reveal.maxRequests <= read.maxRequests);
  });

  it("maps tool names from canonical actions", () => {
    assert.equal(
      mcpToolNameFromAction("organization.list"),
      "organization_list",
    );
  });

  it("registers handlers for exposed product actions", async () => {
    const { listMcpExposedActions, mcpActionHandlers } = await import(
      "@env-manager/api/mcp"
    );
    const actions = listMcpExposedActions();
    assert.ok(actions.length >= 40);
    for (const action of actions) {
      assert.ok(mcpActionHandlers[action], `missing handler for ${action}`);
    }
  });
});
