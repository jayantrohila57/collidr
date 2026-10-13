import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isDashboardRootPath } from "./page-back";

describe("isDashboardRootPath", () => {
  it("treats dashboard list routes as roots without inline back", () => {
    for (const path of [
      "/dashboard",
      "/dashboard/projects",
      "/dashboard/organizations",
      "/dashboard/notifications",
    ]) {
      assert.equal(isDashboardRootPath(path), true);
    }
  });

  it("does not treat nested routes as list roots", () => {
    assert.equal(isDashboardRootPath("/dashboard/projects/acme"), false);
    assert.equal(isDashboardRootPath("/dashboard/settings/profile"), false);
  });
});
