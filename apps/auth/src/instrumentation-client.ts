import { configureLogger } from "@loftlancer/logger";
import { createSentrySink } from "@loftlancer/logger/sentry";
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Sentry stays off until NEXT_PUBLIC_SENTRY_DSN exists (#339).
if (dsn) {
  Sentry.init({
    dsn,
    // Same release name as the server and the source-map upload (#354).
    release: `loftlancer@${process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0"}`,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    initialScope: { tags: { app: "auth" } },
    tracesSampleRate: 0.1,
  });
  // Browser logs from @loftlancer/logger go to Sentry Logs via Sentry.logger
  // (#355). SDK v11 removed `enableLogs`; using the logger API is the opt-in.
  configureLogger({
    context: { app: "auth", runtime: "browser" },
    sink: createSentrySink(Sentry),
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
