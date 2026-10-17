import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isOrgScopedQueryReady } from "./org-scoped-query-ready";

const base = {
  orgsEnabled: true,
  isSwitching: false,
  sessionPending: false,
  activeOrganizationId: null,
  sessionOrganizationId: null,
  urlOrgSlug: null,
};

describe("isOrgScopedQueryReady", () => {
  it("is false while the session or an org switch is in flight", () => {
    assert.equal(
      isOrgScopedQueryReady({ ...base, sessionPending: true }),
      false,
    );
    assert.equal(isOrgScopedQueryReady({ ...base, isSwitching: true }), false);
  });

  it("is true when organizations are disabled", () => {
    assert.equal(isOrgScopedQueryReady({ ...base, orgsEnabled: false }), true);
  });

  it("is true when the session, URL, or client active org is known", () => {
    assert.equal(
      isOrgScopedQueryReady({
        ...base,
        sessionOrganizationId: "org-session",
      }),
      true,
    );
    assert.equal(isOrgScopedQueryReady({ ...base, urlOrgSlug: "acme" }), true);
    assert.equal(
      isOrgScopedQueryReady({
        ...base,
        activeOrganizationId: "org-client",
      }),
      true,
    );
  });

  it("is false when orgs are on but no org scope is known yet", () => {
    assert.equal(isOrgScopedQueryReady(base), false);
  });
});
