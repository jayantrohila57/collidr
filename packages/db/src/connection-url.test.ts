import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  normalizeDatabaseSslModeInUrl,
  resolveDatabaseConnectionString,
} from "./connection-url";

describe("normalizeDatabaseSslModeInUrl", () => {
  it("rewrites sslmode=require to verify-full", () => {
    const input =
      "postgresql://user:pass@ep-example.neon.tech/neondb?sslmode=require";
    const output = normalizeDatabaseSslModeInUrl(input);
    assert.match(output, /sslmode=verify-full/);
    assert.doesNotMatch(output, /sslmode=require/);
  });

  it("rewrites prefer and verify-ca to verify-full", () => {
    assert.match(
      normalizeDatabaseSslModeInUrl("postgresql://localhost/db?sslmode=prefer"),
      /sslmode=verify-full/,
    );
    assert.match(
      normalizeDatabaseSslModeInUrl(
        "postgresql://localhost/db?sslmode=verify-ca",
      ),
      /sslmode=verify-full/,
    );
  });

  it("leaves verify-full and other modes unchanged", () => {
    const verifyFull =
      "postgresql://localhost/db?sslmode=verify-full&connect_timeout=10";
    assert.equal(normalizeDatabaseSslModeInUrl(verifyFull), verifyFull);
    const disable = "postgresql://localhost/db?sslmode=disable";
    assert.equal(normalizeDatabaseSslModeInUrl(disable), disable);
  });

  it("returns invalid URLs unchanged", () => {
    const invalid = "not-a-url";
    assert.equal(normalizeDatabaseSslModeInUrl(invalid), invalid);
  });
});

describe("resolveDatabaseConnectionString", () => {
  it("normalizes pooled override URLs", () => {
    const previous = process.env.DATABASE_URL_POOLED;
    process.env.DATABASE_URL_POOLED =
      "postgresql://user:pass@host/db?sslmode=require";
    try {
      const resolved = resolveDatabaseConnectionString(
        "postgresql://ignored/db?sslmode=require",
      );
      assert.match(resolved, /sslmode=verify-full/);
    } finally {
      if (previous === undefined) {
        delete process.env.DATABASE_URL_POOLED;
      } else {
        process.env.DATABASE_URL_POOLED = previous;
      }
    }
  });
});
