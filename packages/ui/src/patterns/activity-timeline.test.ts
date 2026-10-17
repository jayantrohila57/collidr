import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { auditRowToActivityItem } from "./activity-timeline";

describe("auditRowToActivityItem", () => {
  const base = {
    id: "1",
    action: "project.create",
    result: "success",
    actorUserId: "u1",
    actorName: "Ada",
    actorEmail: null,
    projectId: "p1",
    projectName: "Demo",
    projectSlug: "demo",
    organizationSlug: "acme",
    entityType: "project",
    entitySlug: null,
    targetUserId: null,
    denialReason: null,
    errorCode: null,
    createdAt: "2026-01-01T00:00:00.000Z",
  };

  it("uses past-tense verbs for mutating actions", () => {
    const item = auditRowToActivityItem(base, {
      projectHref: () => "/acme/demo",
    });
    assert.equal(item.verb, "created project");
    assert.equal(item.actor.name, "Ada");
  });

  it("uses registry labels instead of raw codes for passive actions", () => {
    const item = auditRowToActivityItem(
      { ...base, action: "audit.timeline.view.org", projectId: null },
      { projectHref: () => null },
    );
    assert.equal(item.verb, "View organization audit timeline");
  });
});
