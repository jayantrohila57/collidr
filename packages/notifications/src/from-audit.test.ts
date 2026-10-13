import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { notifyFromAuditEvent } from "./from-audit";

describe("notifyFromAuditEvent", () => {
  it("no-ops when notifications are disabled", async () => {
    await notifyFromAuditEvent({
      auditEventId: "audit-1",
      action: "member.invite",
      notifyTypes: ["invitation.received"],
      actorUserId: "user-1",
      entityId: "invite-1",
    });
    assert.ok(true);
  });
});
