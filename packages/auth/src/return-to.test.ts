import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateReturnTo } from "./return-to";

describe("validateReturnTo", () => {
  it("accepts allowlisted https URLs", () => {
    const result = validateReturnTo(
      "https://loftlancer.com/studio/dashboard",
      {
        allowedOrigins: ["https://loftlancer.com"],
        fallback: "https://loftlancer.com/studio/dashboard",
      },
    );
    assert.equal(result, "https://loftlancer.com/studio/dashboard");
  });

  it("rejects javascript: URLs", () => {
    const result = validateReturnTo("javascript:alert(1)", {
      allowedOrigins: ["https://loftlancer.com"],
      fallback: "https://loftlancer.com/studio/dashboard",
    });
    assert.equal(result, "https://loftlancer.com/studio/dashboard");
  });
});
