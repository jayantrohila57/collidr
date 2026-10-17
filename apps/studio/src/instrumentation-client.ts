import {
  buildSentryInitOptions,
  wireSentryLogger,
} from "@loftlancer/logger/sentry-instrument";
import * as Sentry from "@sentry/nextjs";

const options = buildSentryInitOptions("studio", true);
if (options.dsn) {
  Sentry.init(options);
  wireSentryLogger(Sentry, "studio", { runtime: "browser" });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
