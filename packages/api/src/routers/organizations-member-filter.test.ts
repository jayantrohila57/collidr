import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const routerSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "organizations.ts"),
  "utf8",
);

describe("organizations router member filters", () => {
  it("filters list and getBySlug with activeMemberWhere", () => {
    const matches = routerSource.match(/activeMemberWhere/g);
    assert.ok(
      matches && matches.length >= 2,
      "expected activeMemberWhere on list and getBySlug member joins",
    );
  });
});
