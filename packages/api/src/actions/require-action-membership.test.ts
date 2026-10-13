import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const requireActionSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "require-action.ts"),
  "utf8",
);

describe("requireAction org membership lookup", () => {
  it("filters soft-deleted members via activeMemberWhere", () => {
    const memberQueryStart = requireActionSource.indexOf(".from(member)");
    assert.ok(
      memberQueryStart >= 0,
      "expected member table lookup in require-action",
    );

    const memberQueryEnd = requireActionSource.indexOf(
      ".limit(1)",
      memberQueryStart,
    );
    assert.ok(memberQueryEnd > memberQueryStart);

    const membershipQuery = requireActionSource.slice(
      memberQueryStart,
      memberQueryEnd,
    );
    assert.match(membershipQuery, /activeMemberWhere\s*\(/);
  });
});
