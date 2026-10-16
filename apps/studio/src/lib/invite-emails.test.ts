import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assignableInviteRoles, parseInviteEmails } from "./invite-emails";

describe("parseInviteEmails", () => {
  it("splits, lowercases, dedupes and validates", () => {
    const rows = parseInviteEmails(
      "A@x.io, b@x.io\nnot-an-email; a@x.io <c@y.dev> m@x.io p@x.io",
      { memberEmails: ["M@x.io"], pendingEmails: ["p@x.io"] },
    );
    assert.deepEqual(rows, [
      { email: "a@x.io", status: "valid" },
      { email: "b@x.io", status: "valid" },
      { email: "not-an-email", status: "invalid" },
      { email: "a@x.io", status: "duplicate" },
      { email: "c@y.dev", status: "valid" },
      { email: "m@x.io", status: "member" },
      { email: "p@x.io", status: "pending" },
    ]);
  });
  it("returns nothing for blank input", () => {
    assert.deepEqual(parseInviteEmails("  \n , "), []);
  });
});

describe("assignableInviteRoles", () => {
  it("limits roles by inviter", () => {
    assert.deepEqual(assignableInviteRoles("owner"), [
      "member",
      "manager",
      "owner",
    ]);
    assert.deepEqual(assignableInviteRoles("manager"), ["member", "manager"]);
    assert.deepEqual(assignableInviteRoles("member"), []);
    assert.deepEqual(assignableInviteRoles(null), []);
  });
});
