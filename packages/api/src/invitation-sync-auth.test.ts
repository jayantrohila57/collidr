import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeInviteEmail,
  organizationIdFromInviteSyncInput,
} from "./invitation-sync-input";

describe("organizationIdFromInviteSyncInput", () => {
  it("returns organizationId from sync mutation input", () => {
    assert.deepEqual(
      organizationIdFromInviteSyncInput({
        organizationId: "org_1",
        email: "a@example.com",
      }),
      { organizationId: "org_1" },
    );
  });

  it("returns empty object for invalid input", () => {
    assert.deepEqual(organizationIdFromInviteSyncInput(null), {});
    assert.deepEqual(organizationIdFromInviteSyncInput({ email: "a@b.c" }), {});
  });
});

describe("normalizeInviteEmail", () => {
  it("trims and lowercases email", () => {
    assert.equal(
      normalizeInviteEmail("  User@Example.COM  "),
      "user@example.com",
    );
  });
});
