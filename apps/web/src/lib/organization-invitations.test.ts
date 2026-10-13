import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  countPendingInvitations,
  parseOrganizationInvitations,
  pendingOrganizationInvitations,
  sortOrganizationInvitations,
  toOrganizationInviteRole,
} from "./organization-invitations";

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

  it("sorts pending invitations before other statuses", () => {
    const row = (status: string) => ({
      id: status,
      email: "a@example.com",
      role: "member",
      status,
      expiresAt: "2026-12-01T00:00:00.000Z",
    });
    const sorted = sortOrganizationInvitations([
      row("accepted"),
      row("pending"),
      row("canceled"),
    ]);
    assert.equal(sorted[0].status, "pending");
  });

  it("normalizes invitation roles for resend", () => {
    assert.equal(toOrganizationInviteRole("owner"), "owner");
    assert.equal(toOrganizationInviteRole("MANAGER"), "manager");
    assert.equal(toOrganizationInviteRole("custom"), "member");
  });
});
