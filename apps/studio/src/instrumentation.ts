import { configureLogger } from "@loftlancer/logger";
import { createSentrySink } from "@loftlancer/logger/sentry";
import * as Sentry from "@sentry/nextjs";

// Sentry stays off until SENTRY_DSN exists (#339).
export async function register() {
  const release = `loftlancer@${process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0"}`;
  configureLogger({ context: { app: "studio", release } });
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    release,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    initialScope: { tags: { app: "studio" } },
    tracesSampleRate: 0.1,
  });
  // Server logs from @loftlancer/logger land in Sentry Logs via Sentry.logger
  // (#355). SDK v11 removed `enableLogs`; using the logger API is the opt-in.
  configureLogger({ sink: createSentrySink(Sentry) });
}

export const onRequestError = Sentry.captureRequestError;
