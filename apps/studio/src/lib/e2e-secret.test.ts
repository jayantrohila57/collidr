import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { isValidE2eSecret } from "./e2e-secret";

const originalSecret = process.env.E2E_TEST_SECRET;

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.E2E_TEST_SECRET;
  } else {
    process.env.E2E_TEST_SECRET = originalSecret;
  }
});

describe("isValidE2eSecret", () => {
  it("rejects the legacy default when E2E_TEST_SECRET is unset", () => {
    delete process.env.E2E_TEST_SECRET;
    const request = new Request("http://localhost/api/e2e/login", {
      headers: { "x-e2e-secret": "local-e2e-secret" },
    });
    assert.equal(isValidE2eSecret(request), false);
  });

  it("rejects when the header does not match", () => {
    process.env.E2E_TEST_SECRET = "configured-secret";
    const request = new Request("http://localhost/api/e2e/login", {
      headers: { "x-e2e-secret": "local-e2e-secret" },
    });
    assert.equal(isValidE2eSecret(request), false);
  });

  it("accepts when the header matches E2E_TEST_SECRET", () => {
    process.env.E2E_TEST_SECRET = "configured-secret";
    const request = new Request("http://localhost/api/e2e/login", {
      headers: { "x-e2e-secret": "configured-secret" },
    });
    assert.equal(isValidE2eSecret(request), true);
  });
});
