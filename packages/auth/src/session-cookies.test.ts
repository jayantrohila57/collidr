import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COLLIDR_COOKIE_PREFIX,
  findLegacySessionCookie,
  getCollidrSessionToken,
  hasSessionCookieFromAnyPrefix,
  isLegacySessionCookieName,
  legacySessionCookieNamesToExpire,
} from "./session-cookies";

describe("session-cookies", () => {
  it("reads collidr session token", () => {
    const headers = new Headers({
      cookie: "collidr.session_token=signed-token-value",
    });
    assert.equal(getCollidrSessionToken(headers), "signed-token-value");
  });

  it("finds legacy better-auth cookie when collidr is absent", () => {
    const headers = new Headers({
      cookie: "better-auth.session_token=legacy-signed-value",
    });
    const hit = findLegacySessionCookie(headers);
    assert.ok(hit);
    assert.equal(hit.prefix, "better-auth");
    assert.equal(hit.rawValue, "legacy-signed-value");
  });

  it("prefers collidr over legacy", () => {
    const headers = new Headers({
      cookie:
        "collidr.session_token=new&better-auth.session_token=legacy-signed-value",
    });
    assert.equal(findLegacySessionCookie(headers), null);
    assert.equal(hasSessionCookieFromAnyPrefix(headers), true);
  });

  it("lists legacy cookie names to expire", () => {
    const names = legacySessionCookieNamesToExpire("env-manager");
    assert.ok(names.includes("env-manager.session_token"));
    assert.ok(names.includes("__Secure-env-manager.session_token"));
  });

  it("detects legacy cookie names", () => {
    assert.equal(
      isLegacySessionCookieName("__Secure-better-auth.session_token"),
      true,
    );
    assert.equal(
      isLegacySessionCookieName(`${COLLIDR_COOKIE_PREFIX}.session_token`),
      false,
    );
  });
});
