import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isInviteMemberFormDirty, isTeamCreateFormDirty } from "./form-dirty";

describe("form-dirty helpers", () => {
  it("detects invite member dirty state", () => {
    assert.equal(isInviteMemberFormDirty("", "member"), false);
    assert.equal(isInviteMemberFormDirty("a@b.com", "member"), true);
    assert.equal(isInviteMemberFormDirty("", "owner"), true);
  });

  it("detects team create dirty state", () => {
    assert.equal(isTeamCreateFormDirty(""), false);
    assert.equal(isTeamCreateFormDirty("  "), false);
    assert.equal(isTeamCreateFormDirty("Platform"), true);
  });
});
