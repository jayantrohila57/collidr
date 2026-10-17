import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { accountSettingsUrl } from "./account-url";

describe("sidebar settings footer link", () => {
  it("targets the account app settings root", () => {
    const previous = process.env.NEXT_PUBLIC_AUTH_URL;
    process.env.NEXT_PUBLIC_AUTH_URL = "https://auth.example.com";
    try {
      assert.equal(
        accountSettingsUrl("/settings"),
        "https://auth.example.com/settings",
      );
    } finally {
      if (previous === undefined) {
        delete process.env.NEXT_PUBLIC_AUTH_URL;
      } else {
        process.env.NEXT_PUBLIC_AUTH_URL = previous;
      }
    }
  });
});
