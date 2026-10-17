import { configureLogger } from "./index";
import {
  resolveSentryDsn,
  resolveSentryEnvironment,
  resolveSentryRelease,
} from "./sentry-env";

export {
  resolveSentryDsn,
  resolveSentryEnvironment,
  resolveSentryRelease,
} from "./sentry-env";

import { createSentrySink, type SentryLike } from "./sentry";

export type LoftlancerApp = "auth" | "studio" | "docs";

export type SentryInitLike = SentryLike & {
  init: (options: Record<string, unknown>) => void;
  flush?: (timeout?: number) => Promise<boolean>;
};

/** Flush buffered Sentry Logs before the serverless function exits (#355). */
function scheduleSentryFlush(sentry: SentryInitLike): void {
  if (!sentry.flush) return;
  const flushPromise = sentry.flush(2000);
  if (typeof globalThis !== "undefined" && "window" in globalThis) {
    void flushPromise;
    return;
  }
  void import("@sentry/core/server")
    .then(({ vercelWaitUntil }) => {
      vercelWaitUntil(flushPromise);
    })
    .catch(() => {
      void flushPromise;
    });
}

/** Wire @loftlancer/logger to Sentry Logs after Sentry.init. */
export function wireSentryLogger(
  sentry: SentryInitLike,
  app: LoftlancerApp,
  options: { runtime: "browser" | "server" },
): void {
  const release = resolveSentryRelease();
  configureLogger({
    context: {
      app,
      ...(options.runtime === "server" ? { release } : { runtime: "browser" }),
    },
    sink: createSentrySink(sentry, {
      onAfterLog: () => scheduleSentryFlush(sentry),
    }),
  });
}

/** Node server runtime: init Sentry and wire the shared logger sink. */
export function initAndWireSentryServer(
  sentry: SentryInitLike,
  app: LoftlancerApp,
): void {
  const dsn = resolveSentryDsn();
  if (!dsn) return;
  const release = resolveSentryRelease();
  configureLogger({ context: { app, release } });
  sentry.init({
    dsn,
    release,
    environment: resolveSentryEnvironment(false),
    initialScope: { tags: { app } },
    tracesSampleRate: 0.1,
  });
  wireSentryLogger(sentry, app, { runtime: "server" });
}
