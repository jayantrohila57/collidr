import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { isEmailConfigured, sendEmail } from "./send";

test("sendEmail is a no-op without RESEND_API_KEY", async () => {
  delete process.env.RESEND_API_KEY;
  assert.equal(isEmailConfigured(), false);
  const result = await sendEmail({
    to: "a@example.com",
    subject: "x",
    react: createElement("p", null, "hi"),
  });
  assert.deepEqual(result, { status: "skipped", reason: "not-configured" });
});
