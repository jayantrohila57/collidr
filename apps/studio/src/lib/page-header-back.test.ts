import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolvePageHeaderBack } from "./page-header-back";

describe("resolvePageHeaderBack", () => {
  it("returns null when back is false (list pages stay left-aligned)", () => {
    assert.equal(resolvePageHeaderBack(false, "/acme/projects"), null);
  });

  it("returns null on dashboard root paths for auto back", () => {
    assert.equal(resolvePageHeaderBack("auto", "/notifications"), null);
    assert.equal(resolvePageHeaderBack(undefined, "/activity"), null);
  });

  it("resolves parent href for nested routes", () => {
    const resolved = resolvePageHeaderBack("auto", "/acme/web/settings");
    assert.deepEqual(resolved, {
      href: "/acme/web",
      fallbackHref: "/acme/web",
      useHistory: false,
    });
  });
});
