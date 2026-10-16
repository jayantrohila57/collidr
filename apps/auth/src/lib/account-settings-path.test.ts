import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isRecognizedAccountSettingsPath } from "./account-settings-path";

describe("isRecognizedAccountSettingsPath", () => {
  it("recognizes settings timeline route", () => {
    assert.equal(isRecognizedAccountSettingsPath("/settings/timeline"), true);
  });

  it("rejects unknown dashboard paths", () => {
    assert.equal(isRecognizedAccountSettingsPath("/activity"), false);
  });
});
