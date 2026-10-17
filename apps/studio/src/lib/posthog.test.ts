import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  callPostHog,
  captureEvent,
  identifyUser,
  ORGANIZATION_GROUP,
  resetPostHog,
  STUDIO_EVENTS,
  setOrganizationGroup,
} from "./posthog";

describe("callPostHog", () => {
  it("does nothing without PostHog", () => {
    assert.doesNotThrow(() => callPostHog("capture", ["x"], {}));
    assert.doesNotThrow(() => callPostHog("capture", ["x"], undefined));
  });

  it("queues calls on the snippet stub before array.js loads", () => {
    const stub: unknown[] = [];
    const host = { posthog: stub };
    identifyUser("user_1", host);
    setOrganizationGroup("org_1", host);
    captureEvent(STUDIO_EVENTS.projectCreated, { source: "onboarding" }, host);
    resetPostHog(host);
    assert.deepEqual(stub, [
      ["identify", "user_1"],
      ["group", ORGANIZATION_GROUP, "org_1"],
      ["capture", "project created", { source: "onboarding" }],
      ["reset"],
    ]);
  });

  it("calls the loaded instance directly", () => {
    const calls: unknown[][] = [];
    const instance = {
      identify: (...args: unknown[]) => calls.push(["identify", ...args]),
      capture: (...args: unknown[]) => calls.push(["capture", ...args]),
    };
    const host = { posthog: instance };
    identifyUser("user_2", host);
    captureEvent(STUDIO_EVENTS.variableDeleted, undefined, host);
    assert.deepEqual(calls, [
      ["identify", "user_2"],
      ["capture", "variable deleted"],
    ]);
  });

  it("identifies by id only, with no person properties", () => {
    const stub: unknown[] = [];
    identifyUser("user_3", { posthog: stub });
    assert.deepEqual(stub, [["identify", "user_3"]]);
  });

  it("swallows errors thrown by PostHog", () => {
    const host = {
      posthog: {
        capture: () => {
          throw new Error("boom");
        },
      },
    };
    assert.doesNotThrow(() =>
      captureEvent(STUDIO_EVENTS.environmentCreated, undefined, host),
    );
  });
});
