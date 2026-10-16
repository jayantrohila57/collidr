import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPageBackHref, isDashboardRootPath } from "./page-back";

describe("isDashboardRootPath", () => {
  it("treats top-level list routes as roots", () => {
    for (const path of ["/", "/notifications", "/activity", "/support"]) {
      assert.equal(isDashboardRootPath(path), true);
    }
  });

  it("does not treat nested routes as roots", () => {
    assert.equal(isDashboardRootPath("/acme/web"), false);
    assert.equal(isDashboardRootPath("/support/tickets"), false);
  });
});

describe("getPageBackHref", () => {
  it("walks up the URL hierarchy", () => {
    assert.equal(getPageBackHref("/acme"), "/");
    assert.equal(getPageBackHref("/acme/projects"), "/acme");
    assert.equal(getPageBackHref("/acme/web"), "/acme/projects");
    assert.equal(getPageBackHref("/acme/web/settings"), "/acme/web");
    assert.equal(getPageBackHref("/acme/web/tasks/12"), "/acme/web/tasks");
    assert.equal(getPageBackHref("/support/tickets/t1"), "/support/tickets");
  });
});
