import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { evaluatePermission } from "@loftlancer/actions";

const projectListSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "project-list.ts"),
  "utf8",
);

const projectsRouterSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "routers", "projects.ts"),
  "utf8",
);

describe("project list RBAC (project.read)", () => {
  it("allows org owners to read any project", () => {
    const decision = evaluatePermission({
      action: "project.read",
      orgRole: "owner",
      project: {
        isProjectCreator: false,
        isProjectManager: false,
        memberGrants: [],
        hasTeamLink: false,
      },
    });
    assert.equal(decision.allowed, true);
  });

  it("allows org managers assigned as project manager", () => {
    const decision = evaluatePermission({
      action: "project.read",
      orgRole: "manager",
      project: { isProjectManager: true },
    });
    assert.equal(decision.allowed, true);
  });

  it("denies org managers without a project assignment", () => {
    const decision = evaluatePermission({
      action: "project.read",
      orgRole: "manager",
      project: { isProjectManager: false, isProjectCreator: false },
    });
    assert.equal(decision.allowed, false);
  });

  it("allows members with team link and project.read grant", () => {
    const decision = evaluatePermission({
      action: "project.read",
      orgRole: "member",
      project: {
        hasTeamLink: true,
        memberGrants: ["project.read"],
      },
    });
    assert.equal(decision.allowed, true);
  });

  it("denies members without team link or grant (non-member on project)", () => {
    const withoutTeam = evaluatePermission({
      action: "project.read",
      orgRole: "member",
      project: { hasTeamLink: false, memberGrants: ["project.read"] },
    });
    assert.equal(withoutTeam.allowed, false);

    const withoutGrant = evaluatePermission({
      action: "project.read",
      orgRole: "member",
      project: { hasTeamLink: true, memberGrants: [] },
    });
    assert.equal(withoutGrant.allowed, false);
  });

  it("denies users with no org role", () => {
    const decision = evaluatePermission({
      action: "project.read",
      orgRole: null,
      project: { isProjectManager: true, hasTeamLink: true },
    });
    assert.equal(decision.allowed, false);
  });
});

describe("project list/detail scope alignment (#26)", () => {
  it("resolves accessible IDs by org role in listAccessibleProjectIds", () => {
    assert.match(projectListSource, /orgRole === "owner"/);
    assert.match(projectListSource, /orgRole === "manager"/);
    assert.match(projectListSource, /projectMemberGrant/);
  });

  it("projectReadWhere falls back to owner filter only when orgs are off", () => {
    assert.match(
      projectListSource,
      /listAccessibleProjectIds[\s\S]*projectListFilter/,
    );
  });

  it("projects list and get share projectReadWhere", () => {
    const listBlock = projectsRouterSource.match(
      /list:\s*orgProcedure[\s\S]*?get:\s*orgProcedure/,
    )?.[0];
    assert.ok(listBlock, "expected list procedure before get");
    assert.match(listBlock, /projectReadWhere/);
    assert.doesNotMatch(
      listBlock,
      /projectListFilter\(/,
      "list must not use owner-only projectListFilter",
    );

    const getBlock = projectsRouterSource.match(
      /get:\s*orgProcedure[\s\S]*?getBySlug:\s*orgProcedure/,
    )?.[0];
    assert.ok(getBlock, "expected get procedure before getBySlug");
    assert.match(getBlock, /projectReadWhere/);
    assert.doesNotMatch(getBlock, /projectListFilter\(/);
  });
});
