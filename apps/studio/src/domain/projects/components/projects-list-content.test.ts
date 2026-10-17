import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "projects-list-content.tsx"),
  "utf8",
);

test("projects list toolbar exposes New project in grid and list views (#55)", () => {
  assert.match(source, /primaryAction=\{newProjectButton\}/);
  assert.match(source, /const newProjectButton = onCreateProject/);
});

test("projects grid uses equal-width card layout (#55)", () => {
  const gridSource = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "projects-grid-view.tsx"),
    "utf8",
  );
  assert.match(gridSource, /\[&>\*\]:w-full/);
  assert.match(gridSource, /self-stretch/);

  const cardSource = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "project-card.tsx"),
    "utf8",
  );
  assert.match(cardSource, /w-full min-w-0/);
});
