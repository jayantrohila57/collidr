import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isRecognizedDashboardPath } from "./dashboard-path";

describe("isRecognizedDashboardPath", () => {
  const emptySlugs = new Set<string>();

  it("recognizes global timeline route", () => {
    assert.equal(
      isRecognizedDashboardPath("/dashboard/timeline", emptySlugs, true),
      true,
    );
  });

  it("recognizes settings timeline tab", () => {
    assert.equal(
      isRecognizedDashboardPath("/settings/timeline", emptySlugs, true),
      true,
    );
  });

  it("recognizes organization timeline route", () => {
    assert.equal(
      isRecognizedDashboardPath(
        "/dashboard/organizations/acme/timeline",
        emptySlugs,
        true,
      ),
      true,
    );
  });
});
