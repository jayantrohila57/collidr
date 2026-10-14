import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isBenignClientError } from "./client-errors";

describe("isBenignClientError", () => {
  it("treats CancelledError and AbortError as benign", () => {
    assert.equal(isBenignClientError({ name: "CancelledError" }), true);
    assert.equal(isBenignClientError({ name: "AbortError" }), true);
  });

  it("treats cancel messages as benign", () => {
    assert.equal(isBenignClientError(new Error("Query cancelled")), true);
  });

  it("does not treat ordinary errors as benign", () => {
    assert.equal(isBenignClientError(new Error("Not found")), false);
    assert.equal(isBenignClientError(null), false);
  });
});
