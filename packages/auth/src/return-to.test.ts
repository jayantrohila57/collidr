import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateReturnTo } from "./return-to";

describe("validateReturnTo", () => {
  it("accepts allowlisted https URLs", () => {
    const result = validateReturnTo("https://studio-env-manager.vercel.app/dashboard", {
      allowedOrigins: ["https://studio-env-manager.vercel.app"],
      fallback: "https://studio-env-manager.vercel.app/dashboard",
    });
    assert.equal(result, "https://studio-env-manager.vercel.app/dashboard");
  });

  it("rejects javascript: URLs", () => {
    const result = validateReturnTo("javascript:alert(1)", {
      allowedOrigins: ["https://studio-env-manager.vercel.app"],
      fallback: "https://studio-env-manager.vercel.app/dashboard",
    });
    assert.equal(result, "https://studio-env-manager.vercel.app/dashboard");
  });
});
