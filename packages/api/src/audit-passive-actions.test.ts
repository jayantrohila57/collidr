import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPassiveAuditAction } from "./audit-passive-actions";

describe("isPassiveAuditAction", () => {
  it("treats read and view actions as passive", () => {
    assert.equal(isPassiveAuditAction("project.read"), true);
    assert.equal(isPassiveAuditAction("environment.read"), true);
    assert.equal(isPassiveAuditAction("audit.timeline.view.org"), true);
    assert.equal(isPassiveAuditAction("audit.timeline.view.self"), true);
    assert.equal(isPassiveAuditAction("organization.hub.view"), true);
  });

  it("keeps mutating actions visible by default", () => {
    assert.equal(isPassiveAuditAction("project.create"), false);
    assert.equal(isPassiveAuditAction("variable.update"), false);
    assert.equal(isPassiveAuditAction("member.invite"), false);
    assert.equal(isPassiveAuditAction("notification.list"), false);
  });
});
