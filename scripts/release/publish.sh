#!/usr/bin/env bash
# Run after the dev -> main release PR is merged, from a clean checkout:
# tags origin/main with its package.json version and creates the GitHub
# Release from that version's CHANGELOG.md section.
# Tags never deploy (vercel.json only deploys pushes to main).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
git fetch origin main --tags
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
git show origin/main:package.json > "$tmp/package.json"
git show origin/main:CHANGELOG.md > "$tmp/CHANGELOG.md"
version=$(node -p "require('$tmp/package.json').version")
tag="v${version}"
if git rev-parse -q --verify "refs/tags/${tag}" >/dev/null; then
  echo "Tag ${tag} already exists" >&2
  exit 1
fi
node --input-type=module -e "
import { readFileSync, writeFileSync } from 'node:fs';
import { changelogSection } from './scripts/release/changelog.mjs';
const section = changelogSection(readFileSync('$tmp/CHANGELOG.md', 'utf8'), '${version}');
if (!section) { console.error('No CHANGELOG.md section for ${version}'); process.exit(1); }
writeFileSync('$tmp/notes.md', section + '\n');
"
git tag -a "${tag}" origin/main -m "Loftlancer ${tag}"
git push origin "refs/tags/${tag}"
gh release create "${tag}" --repo jayantrohila57/loftlancer --title "${tag}" \
  --notes-file "$tmp/notes.md" --verify-tag --latest
echo "Released ${tag}"
