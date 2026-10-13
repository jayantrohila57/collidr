import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ProjectOutput } from "@collidr/api/types";

import {
  isSidebarProjectNavItem,
  SIDEBAR_PROJECT_SLUG_BLOCKLIST,
  selectSidebarProjects,
} from "./sidebar-project-nav";

function project(
  overrides: Partial<ProjectOutput> & {
    id: string;
    slug: string;
    name: string;
  },
): ProjectOutput {
  const base: ProjectOutput = {
    id: overrides.id,
    name: overrides.name,
    slug: overrides.slug,
    description: null,
    status: "active",
    isArchived: false,
    isPublic: false,
    repositoryUrl: null,
    websiteUrl: null,
    userId: "user-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
  return { ...base, ...overrides };
}

describe("isSidebarProjectNavItem", () => {
  it("blocks reserved slugs that collide with routes", () => {
    for (const slug of SIDEBAR_PROJECT_SLUG_BLOCKLIST) {
      assert.equal(
        isSidebarProjectNavItem(project({ id: slug, slug, name: slug })),
        false,
      );
    }
  });
});

describe("selectSidebarProjects", () => {
  const projects = [
    project({
      id: "1",
      slug: "alpha",
      name: "Alpha",
      updatedAt: "2026-01-03T00:00:00.000Z",
    }),
    project({
      id: "2",
      slug: "beta",
      name: "Beta",
      updatedAt: "2026-01-02T00:00:00.000Z",
    }),
    project({
      id: "3",
      slug: "gamma",
      name: "Gamma",
      updatedAt: "2026-01-01T00:00:00.000Z",
    }),
    project({
      id: "4",
      slug: "delta",
      name: "Delta",
      updatedAt: "2025-12-31T00:00:00.000Z",
    }),
  ];

  it("shows at most three projects when collapsed", () => {
    const { visible, listToggleVisible, hiddenCount } = selectSidebarProjects({
      projects,
      listExpanded: false,
    });
    assert.equal(visible.length, 3);
    assert.equal(listToggleVisible, true);
    assert.equal(hiddenCount, 1);
    assert.deepEqual(
      visible.map((p) => p.slug),
      ["alpha", "beta", "gamma"],
    );
  });

  it("shows all projects when expanded", () => {
    const { visible, listToggleVisible, hiddenCount } = selectSidebarProjects({
      projects,
      listExpanded: true,
    });
    assert.equal(visible.length, 4);
    assert.equal(listToggleVisible, true);
    assert.equal(hiddenCount, 0);
  });

  it("pins the active project when it is outside the recent three", () => {
    const { visible } = selectSidebarProjects({
      projects,
      activeSlug: "delta",
      listExpanded: false,
    });
    assert.equal(visible.length, 3);
    assert.ok(visible.some((p) => p.slug === "delta"));
  });
});
