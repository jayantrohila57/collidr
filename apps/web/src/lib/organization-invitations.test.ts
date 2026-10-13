import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  countPendingInvitations,
  parseOrganizationInvitations,
  pendingOrganizationInvitations,
} from "./organization-invitations.ts";

describe("organization-invitations", () => {
  it("parses invitation arrays and nested payloads", () => {
    const row = {
      id: "inv-1",
      email: "a@example.com",
      role: "member",
      status: "pending",
      expiresAt: "2026-12-01T00:00:00.000Z",
    };
    assert.deepEqual(parseOrganizationInvitations([row]), [row]);
    assert.deepEqual(parseOrganizationInvitations({ invitations: [row] }), [
      row,
    ]);
    assert.deepEqual(parseOrganizationInvitations(null), []);
  });

  it("counts pending invitations case-insensitively", () => {
    const invites = [
      { status: "pending" },
      { status: "PENDING" },
      { status: "accepted" },
    ];
    assert.equal(countPendingInvitations(invites), 2);
    assert.equal(pendingOrganizationInvitations(invites as never).length, 2);
  });
});
