import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const routerSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "projects.ts"),
  "utf8",
);

function procedureBlock(name: string, nextName: string): string {
  const match = routerSource.match(
    new RegExp(`${name}:\\s*orgProcedure[\\s\\S]*?${nextName}:`),
  )?.[0];
  assert.ok(match, `expected ${name} procedure in projects router`);
  return match;
}

describe("projects router archive action guards", () => {
  it("guards archive with project.archive", () => {
    const block = procedureBlock("archive", "unarchive");
    assert.match(
      block,
      /actionGuard\("project\.archive", projectIdFromInput\)/,
    );
  });

  it("guards unarchive with project.unarchive", () => {
    const block = procedureBlock("unarchive", "changeStatus");
    assert.match(
      block,
      /actionGuard\("project\.unarchive", projectIdFromInput\)/,
    );
  });
});
