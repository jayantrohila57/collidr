import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatRelativeShort } from "./format-relative-short";

describe("formatRelativeShort", () => {
  const now = new Date(2026, 9, 17, 7, 0); // 17 Oct, 07:00 local

  it("uses local calendar days, not a rolling 24h window (#325)", () => {
    // 8 hours earlier but yesterday: must not say "Today".
    assert.equal(
      formatRelativeShort(new Date(2026, 9, 16, 23, 0), now),
      "1d ago",
    );
    assert.equal(
      formatRelativeShort(new Date(2026, 9, 17, 0, 30), now),
      "Today",
    );
  });

  it("keeps the compact buckets", () => {
    assert.equal(
      formatRelativeShort(new Date(2026, 9, 14, 12, 0), now),
      "3d ago",
    );
    assert.equal(
      formatRelativeShort(new Date(2026, 9, 3, 12, 0), now),
      "2w ago",
    );
    assert.equal(formatRelativeShort("not-a-date", now), "—");
  });
});
