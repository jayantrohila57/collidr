import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluatePermission } from "./evaluate";

describe("evaluatePermission", () => {
  it("allows owners for project-scoped actions", () => {
    const result = evaluatePermission({
      action: "project.update",
      orgRole: "owner",
      project: null,
    });
    assert.equal(result.allowed, true);
  });

  it("denies managers without project assignment", () => {
    const result = evaluatePermission({
      action: "project.update",
      orgRole: "manager",
      project: { isProjectManager: false, isProjectCreator: false },
    });
    assert.equal(result.allowed, false);
    if (!result.allowed) {
      assert.equal(result.reason, "not_project_manager");
    }
  });

  it("allows user-scoped actions without org role", () => {
    const result = evaluatePermission({
      action: "account.export",
      orgRole: null,
      project: null,
    });
    assert.equal(result.allowed, true);
  });

  it("allows project.unarchive for assigned project managers", () => {
    const result = evaluatePermission({
      action: "project.unarchive",
      orgRole: "manager",
      project: { isProjectManager: true, isProjectCreator: false },
    });
    assert.equal(result.allowed, true);
  });

  it("allows notification.mark_unread for any signed-in user", () => {
    const result = evaluatePermission({
      action: "notification.mark_unread",
      orgRole: null,
      project: null,
    });
    assert.equal(result.allowed, true);
  });

  it("allows members with team link and grant", () => {
    const result = evaluatePermission({
      action: "variable.read",
      orgRole: "member",
      project: {
        hasTeamLink: true,
        memberGrants: ["variable.read"],
      },
    });
    assert.equal(result.allowed, true);
  });

  it("denies members on project without team link", () => {
    const result = evaluatePermission({
      action: "variable.read",
      orgRole: "member",
      project: {
        hasTeamLink: false,
        memberGrants: ["variable.read"],
      },
    });
    assert.equal(result.allowed, false);
    if (!result.allowed) {
      assert.equal(result.reason, "no_team_on_project");
    }
  });
});
