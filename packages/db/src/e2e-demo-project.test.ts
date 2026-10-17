import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { E2E_DEMO_PROJECT_SLUG } from "./e2e-demo-project";
import { slugifyPersonal } from "./personal-org-slug";

describe("e2e demo project helpers", () => {
  it("builds a stable personal org slug from user id and name", () => {
    const slug = slugifyPersonal(
      "abcd1234-5678-90ab-cdef-1234567890ab",
      "Playwright E2E",
    );
    assert.equal(slug, "playwright-e2e-personal-abcd1234");
  });

  it("exposes the demo project slug constant", () => {
    assert.equal(E2E_DEMO_PROJECT_SLUG, "e2e-demo-project");
  });
});
