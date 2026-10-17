import {
  resolveSentryDsn,
  resolveSentryEnvironment,
  resolveSentryRelease,
  wireSentryLogger,
} from "@loftlancer/logger/sentry-instrument";
import * as Sentry from "@sentry/nextjs";

const dsn = resolveSentryDsn();

if (dsn) {
  Sentry.init({
    dsn,
    release: resolveSentryRelease(),
    environment: resolveSentryEnvironment(true),
    initialScope: { tags: { app: "auth" } },
    tracesSampleRate: 0.1,
  });
  wireSentryLogger(Sentry, "auth", { runtime: "browser" });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
