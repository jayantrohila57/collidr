// Shared helpers for CHANGELOG.md (Keep a Changelog) used by the release scripts.
import { readFileSync } from "node:fs";

export const CHANGELOG_PATH = new URL("../../CHANGELOG.md", import.meta.url);
export const PACKAGE_PATH = new URL("../../package.json", import.meta.url);
export const REPO_URL = "https://github.com/jayantrohila57/loftlancer";

export const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

export function readVersion() {
  return JSON.parse(readFileSync(PACKAGE_PATH, "utf8")).version;
}

export function parseSemver(version) {
  const match = SEMVER.exec(version);
  if (!match) throw new Error(`Not a semver version: ${version}`);
  return match.slice(1, 4).map(Number);
}

export function compareSemver(a, b) {
  const [pa, pb] = [parseSemver(a), parseSemver(b)];
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

export function bumpVersion(version, kind) {
  const [major, minor, patch] = parseSemver(version);
  if (kind === "major") return `${major + 1}.0.0`;
  if (kind === "minor") return `${major}.${minor + 1}.0`;
  if (kind === "patch") return `${major}.${minor}.${patch + 1}`;
  throw new Error(`Release type must be major, minor or patch (got ${kind})`);
}

/** Body (without the heading) of one `## [version]` section, or null. */
export function changelogSection(text, version) {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => line.startsWith(`## [${version}]`));
  if (start === -1) return null;
  let end = lines.findIndex(
    (line, i) =>
      i > start && (line.startsWith("## [") || /^\[.+\]: /.test(line)),
  );
  if (end === -1) end = lines.length;
  return lines
    .slice(start + 1, end)
    .join("\n")
    .trim();
}

/** Today's date in IST (the team's release timezone), YYYY-MM-DD. */
export function todayIst(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
