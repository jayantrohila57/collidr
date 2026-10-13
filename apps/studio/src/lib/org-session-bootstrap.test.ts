import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { shouldBootstrapSessionActiveOrganization } from "./org-session-bootstrap";

describe("shouldBootstrapSessionActiveOrganization", () => {
  it("bootstraps when session has no active org but a default was resolved", () => {
    assert.equal(
      shouldBootstrapSessionActiveOrganization(null, "org-1", undefined),
      true,
    );
  });

  it("skips when session already has an active org", () => {
    assert.equal(
      shouldBootstrapSessionActiveOrganization("org-1", "org-1", undefined),
      false,
    );
  });

  it("skips when caller passed an explicit active org override", () => {
    assert.equal(
      shouldBootstrapSessionActiveOrganization(null, "org-1", "org-2"),
      false,
    );
  });

  it("skips when no org could be resolved", () => {
    assert.equal(
      shouldBootstrapSessionActiveOrganization(null, null, undefined),
      false,
    );
  });
});
