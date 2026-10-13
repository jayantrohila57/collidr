import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatAppliedFiltersSuccess,
  getDataTableFilterResultCount,
} from "./data-table-filter-refetch";

describe("getDataTableFilterResultCount", () => {
  it("reads total from refetch payloads", () => {
    assert.equal(getDataTableFilterResultCount({ data: { total: 3 } }), 3);
    assert.equal(getDataTableFilterResultCount({ total: 5 }), 5);
  });
});

describe("formatAppliedFiltersSuccess", () => {
  it("formats result counts", () => {
    assert.equal(formatAppliedFiltersSuccess(undefined), "Filters applied");
    assert.equal(formatAppliedFiltersSuccess(1), "Filters applied (1 result)");
    assert.equal(formatAppliedFiltersSuccess(4), "Filters applied (4 results)");
  });
});
