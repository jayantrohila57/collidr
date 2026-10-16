import assert from "node:assert/strict";
import test from "node:test";
import { looksLikeDotenv, parseDotenv } from "./dotenv";

test("parses plain, quoted, export and comments", () => {
  const { entries, invalidLines } = parseDotenv(
    [
      "# comment",
      "A=1",
      "export B = two words # trailing",
      'C="quoted # not comment\\nnext"',
      "D='single'",
      "bad line",
      "A=override",
    ].join("\n"),
  );
  assert.deepEqual(entries, [
    { key: "A", value: "override" },
    { key: "B", value: "two words" },
    { key: "C", value: "quoted # not comment\nnext" },
    { key: "D", value: "single" },
  ]);
  assert.deepEqual(invalidLines, [6]);
});

test("multi-line quoted values", () => {
  const { entries } = parseDotenv('K="line1\nline2"\nN=1');
  assert.deepEqual(entries, [
    { key: "K", value: "line1\nline2" },
    { key: "N", value: "1" },
  ]);
});

test("looksLikeDotenv", () => {
  assert.equal(looksLikeDotenv("hello world"), false);
  assert.equal(looksLikeDotenv("API_KEY=abc"), true);
});
