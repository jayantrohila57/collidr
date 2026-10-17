#!/usr/bin/env node
// Usage: node scripts/release/notes.mjs [version]
// Prints the CHANGELOG.md section for a version (default: package.json).
import { readFileSync } from "node:fs";
import { CHANGELOG_PATH, changelogSection, readVersion } from "./changelog.mjs";

const version = (process.argv[2] ?? readVersion()).replace(/^v/, "");
const section = changelogSection(readFileSync(CHANGELOG_PATH, "utf8"), version);
if (!section) {
  console.error(`No CHANGELOG.md section for ${version}`);
  process.exit(1);
}
process.stdout.write(`${section}\n`);
