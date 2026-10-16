import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { OrgListItem } from "@/components/org/active-organization-context";
import { pathAfterOrganizationSwitch } from "./org-switch-redirect";

const orgB: OrgListItem = {
  id: "org-b",
  name: "Org B",
  slug: "org-b",
};

describe("pathAfterOrganizationSwitch", () => {
  it("redirects to dashboard when next org is missing", () => {
    assert.equal(
      pathAfterOrganizationSwitch("/p/acme", undefined, new Set()),
      "/dashboard",
    );
  });

  it("rewrites org slug segment when on another org's organization route", () => {
    assert.equal(
      pathAfterOrganizationSwitch(
        "/dashboard/organizations/org-a/members",
        orgB,
        new Set(),
      ),
      "/dashboard/organizations/org-b/members",
    );
  });

  it("redirects to projects list when project slug is absent in the new org", () => {
    const slugs = new Set(["other-project"]);
    assert.equal(
      pathAfterOrganizationSwitch("/p/stale-slug", orgB, slugs),
      "/dashboard/projects",
    );
    assert.equal(
      pathAfterOrganizationSwitch("/p/stale-slug/env", orgB, slugs),
      "/dashboard/projects",
    );
  });

  it("keeps project routes when the slug exists in the new org", () => {
    const slugs = new Set(["shared-slug"]);
    assert.equal(
      pathAfterOrganizationSwitch("/p/shared-slug/edit", orgB, slugs),
      null,
    );
  });

  it("does not redirect new project route", () => {
    assert.equal(
      pathAfterOrganizationSwitch("/dashboard/projects/new", orgB, new Set()),
      null,
    );
  });

  it("leaves unrelated dashboard routes unchanged", () => {
    assert.equal(
      pathAfterOrganizationSwitch("/dashboard/settings", orgB, new Set()),
      null,
    );
  });
});
