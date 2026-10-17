import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyPostHogConsent,
  callPostHog,
  captureEvent,
  identifyUser,
  ORGANIZATION_GROUP,
  resetPostHog,
  STUDIO_EVENTS,
  setOrganizationGroup,
  syncInstanceConsent,
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

function fakeInstance(optedOut = false) {
  const calls: unknown[][] = [];
  let out = optedOut;
  return {
    calls,
    instance: {
      has_opted_out_capturing: () => out,
      opt_out_capturing: () => {
        out = true;
        calls.push(["opt_out_capturing"]);
      },
      opt_in_capturing: (...args: unknown[]) => {
        out = false;
        calls.push(["opt_in_capturing", ...args]);
      },
    },
  };
}

describe("applyPostHogConsent", () => {
  it("opts a loaded instance out as soon as consent is withdrawn", () => {
    const { calls, instance } = fakeInstance();
    applyPostHogConsent("denied", { posthog: instance });
    assert.deepEqual(calls, [["opt_out_capturing"]]);
  });

  it("treats a cleared choice as withdrawn", () => {
    const { calls, instance } = fakeInstance();
    applyPostHogConsent("unset", { posthog: instance });
    assert.deepEqual(calls, [["opt_out_capturing"]]);
  });

  it("opts back in, without an $opt_in event, when consent is granted again", () => {
    const { calls, instance } = fakeInstance();
    const host = { posthog: instance };
    applyPostHogConsent("denied", host);
    applyPostHogConsent("granted", host);
    assert.deepEqual(calls, [
      ["opt_out_capturing"],
      ["opt_in_capturing", { captureEventName: false }],
    ]);
  });

  it("does not opt in again when capture is already on", () => {
    const { calls, instance } = fakeInstance();
    applyPostHogConsent("granted", { posthog: instance });
    assert.deepEqual(calls, []);
  });

  it("ignores the pre-hydration null state", () => {
    const { calls, instance } = fakeInstance();
    applyPostHogConsent(null, { posthog: instance });
    assert.deepEqual(calls, []);
  });

  it("queues opt-out and opt-in on the stub before array.js loads", () => {
    const stub: unknown[] = [];
    const host = { posthog: stub };
    applyPostHogConsent("granted", host);
    assert.deepEqual(stub, []);
    applyPostHogConsent("denied", host);
    applyPostHogConsent("granted", host);
    assert.deepEqual(stub, [
      ["opt_out_capturing"],
      ["opt_in_capturing", { captureEventName: false }],
    ]);
  });

  it("does nothing without PostHog", () => {
    assert.doesNotThrow(() => applyPostHogConsent("denied", {}));
  });
});

describe("syncInstanceConsent", () => {
  it("re-enables an opt-out persisted from an earlier page", () => {
    const { calls, instance } = fakeInstance(true);
    syncInstanceConsent(instance, true);
    assert.deepEqual(calls, [
      ["opt_in_capturing", { captureEventName: false }],
    ]);
  });

  it("swallows errors thrown by PostHog", () => {
    const instance = {
      opt_out_capturing: () => {
        throw new Error("boom");
      },
    };
    assert.doesNotThrow(() => syncInstanceConsent(instance, false));
  });
});
