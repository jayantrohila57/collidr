import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const envDir = dirname(fileURLToPath(import.meta.url));

describe("GitHub OAuth env validation", () => {
  it("requires GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in server schema", () => {
    const serverSource = readFileSync(join(envDir, "server.ts"), "utf8");
    assert.match(serverSource, /GITHUB_CLIENT_ID:\s*z\.string\(\)\.min\(1\)/);
    assert.match(
      serverSource,
      /GITHUB_CLIENT_SECRET:\s*z\.string\(\)\.min\(1\)/,
    );
  });

  it("auth reads OAuth credentials from validated server env (passwordless.ts)", () => {
    const authSource = readFileSync(
      join(envDir, "../../auth/src/passwordless.ts"),
      "utf8",
    ).replace(/\r\n/g, "\n");
    assert.match(authSource, /clientId:\s*env\.GITHUB_CLIENT_ID/);
    assert.match(authSource, /clientSecret:\s*env\.GITHUB_CLIENT_SECRET/);
    assert.doesNotMatch(authSource, /process\.env\.GITHUB_CLIENT_ID/);
    assert.doesNotMatch(authSource, /process\.env\.GITHUB_CLIENT_SECRET/);
    assert.match(authSource, /clientId:\s*env\.GOOGLE_CLIENT_ID/);
    assert.doesNotMatch(authSource, /process\.env\.GOOGLE_CLIENT_/);
  });
});
