import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatDate, formatDateTime } from "./format";

describe("formatDate", () => {
  it("formats en-US short month dates consistently", () => {
    assert.equal(formatDate("2026-10-13T12:00:00.000Z"), "Oct 13, 2026");
    assert.equal(formatDate("2026-02-04T12:00:00.000Z"), "Feb 4, 2026");
  });

  it("returns em dash for invalid values", () => {
    assert.equal(formatDate("not-a-date"), "—");
  });
});

describe("formatDateTime", () => {
  it("includes time with the same date style as formatDate", () => {
    const formatted = formatDateTime("2026-10-13T15:30:00.000Z");
    assert.ok(formatted.includes("Oct 13, 2026"));
    assert.match(formatted, /\d{1,2}:\d{2}/);
  });
});
