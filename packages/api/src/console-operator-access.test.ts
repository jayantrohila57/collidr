import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  evaluateConsoleOperatorAccess,
  type ConsoleAccessEvaluation,
} from "./console-operator-access";

describe("evaluateConsoleOperatorAccess", () => {
  it("marks missing session as unauthenticated", () => {
    const result = evaluateConsoleOperatorAccess(null);
    assert.equal(result.allowed, false);
    assert.equal(result.reason, "unauthenticated");
  });

  it("distinguishes unauthenticated from operator denial", () => {
    const unauth: ConsoleAccessEvaluation =
      evaluateConsoleOperatorAccess(null);
    const denied: ConsoleAccessEvaluation = evaluateConsoleOperatorAccess({
      user: {
        id: "u1",
        email: "member@example.com",
        role: "user",
      },
    });
    assert.equal(unauth.reason, "unauthenticated");
    assert.notEqual(denied.reason, "unauthenticated");
    assert.equal(denied.allowed, false);
  });
});
