import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createSentrySink } from "./sentry";
import { resolveSentryDsn, resolveSentryEnvironment } from "./sentry-env";

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SENTRY_DSN;
  delete process.env.SENTRY_DSN;
  delete process.env.VERCEL_ENV;
});

test("resolveSentryDsn prefers NEXT_PUBLIC_SENTRY_DSN", () => {
  process.env.SENTRY_DSN = "https://sentry.io/server";
  process.env.NEXT_PUBLIC_SENTRY_DSN = "https://sentry.io/public";
  assert.equal(resolveSentryDsn(), "https://sentry.io/public");
});

test("resolveSentryDsn falls back to SENTRY_DSN", () => {
  process.env.SENTRY_DSN = "https://sentry.io/server";
  assert.equal(resolveSentryDsn(), "https://sentry.io/server");
});

test("resolveSentryEnvironment uses VERCEL_ENV on the server", () => {
  process.env.VERCEL_ENV = "production";
  process.env.NODE_ENV = "development";
  assert.equal(resolveSentryEnvironment(false), "production");
});

test("createSentrySink calls onAfterLog after forwarding", () => {
  const calls: string[] = [];
  const sink = createSentrySink(
    {
      logger: {
        info: (message) => calls.push(`info:${message}`),
        warn: (message) => calls.push(`warn:${message}`),
        error: (message) => calls.push(`error:${message}`),
      },
      captureException: () => undefined,
      setUser: () => undefined,
      setTag: () => undefined,
    },
    { onAfterLog: () => calls.push("after") },
  );
  sink.log("info", "hello", { app: "test" });
  assert.deepEqual(calls, ["info:hello", "after"]);
});
