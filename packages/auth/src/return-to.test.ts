import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateReturnTo } from "./return-to";

describe("validateReturnTo", () => {
  it("accepts allowlisted https URLs", () => {
    const result = validateReturnTo(
      "https://collidr.vercel.app/studio/dashboard",
      {
        allowedOrigins: ["https://collidr.vercel.app"],
        fallback: "https://collidr.vercel.app/studio/dashboard",
      },
    );
    assert.equal(result, "https://collidr.vercel.app/studio/dashboard");
  });

  it("rejects javascript: URLs", () => {
    const result = validateReturnTo("javascript:alert(1)", {
      allowedOrigins: ["https://collidr.vercel.app"],
      fallback: "https://collidr.vercel.app/studio/dashboard",
    });
    assert.equal(result, "https://collidr.vercel.app/studio/dashboard");
  });
});
