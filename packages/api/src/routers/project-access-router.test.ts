import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const routerSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "project-access-router.ts"),
  "utf8",
);

function assignManagerBlock(): string {
  const start = routerSource.indexOf("assignManager:");
  assert.notEqual(start, -1);
  const end = routerSource.indexOf("setMemberGrants:", start);
  assert.notEqual(end, -1);
  return routerSource.slice(start, end);
}

describe("projectAccessRouter assignManager", () => {
  it("passes projectId into actionGuard for project-scoped RBAC", () => {
    const block = assignManagerBlock();
    assert.match(
      block,
      /actionGuard\("project\.assign_manager",\s*\(input\)\s*=>\s*\(\{\s*projectId:/,
    );
  });

  it("calls assertProjectAccess before inserting a manager row", () => {
    const block = assignManagerBlock();
    const assertIdx = block.indexOf("assertProjectAccess(");
    const insertIdx = block.indexOf("db.insert(projectManager)");
    assert.notEqual(assertIdx, -1);
    assert.notEqual(insertIdx, -1);
    assert.ok(assertIdx < insertIdx);
  });
});
