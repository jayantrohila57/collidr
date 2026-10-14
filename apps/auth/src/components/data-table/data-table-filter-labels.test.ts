import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dataTableFilterOptionLabel,
  formatDataTableFilterLabel,
} from "./data-table-filter-labels";

describe("formatDataTableFilterLabel", () => {
  it("capitalizes enum-like values", () => {
    assert.equal(formatDataTableFilterLabel("maintenance"), "Maintenance");
    assert.equal(formatDataTableFilterLabel("bulk_import"), "Bulk import");
  });

  it("prefers explicit labels in dataTableFilterOptionLabel", () => {
    assert.equal(
      dataTableFilterOptionLabel("active", "Active projects"),
      "Active projects",
    );
  });
});
