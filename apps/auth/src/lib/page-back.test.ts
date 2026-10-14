import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isDashboardRootPath } from "./page-back";

describe("isDashboardRootPath", () => {
  it("treats settings home as a root without inline back", () => {
    assert.equal(isDashboardRootPath("/settings"), true);
  });

  it("does not treat nested settings routes as list roots", () => {
    assert.equal(isDashboardRootPath("/settings/profile"), false);
  });
});
