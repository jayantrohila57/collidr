import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildSignInUrl,
  buildSignOutUrl,
  defaultStudioReturnTo,
} from "./auth-links";

describe("defaultStudioReturnTo", () => {
  it("uses explicit studio URL", () => {
    assert.equal(
      defaultStudioReturnTo({ studioUrl: "https://studio.example.com" }),
      "https://studio.example.com/dashboard",
    );
  });
});

describe("buildSignOutUrl", () => {
  it("builds sign-out with encoded return_to", () => {
    const url = buildSignOutUrl({
      authUrl: "https://auth.example.com",
      returnTo: "https://studio.example.com/dashboard",
    });
    assert.equal(
      url,
      "https://auth.example.com/sign-out?return_to=https%3A%2F%2Fstudio.example.com%2Fdashboard",
    );
  });
});

describe("buildSignInUrl", () => {
  it("builds sign-in with encoded return_to", () => {
    const url = buildSignInUrl({
      authUrl: "https://auth.example.com",
      returnTo: "https://studio.example.com/dashboard",
    });
    assert.equal(
      url,
      "https://auth.example.com/sign-in?return_to=https%3A%2F%2Fstudio.example.com%2Fdashboard",
    );
  });
});
