import { initAndWireSentryServer } from "@loftlancer/logger/sentry-instrument";
import * as Sentry from "@sentry/nextjs";

// Node server only; edge has no @loftlancer/logger server sink today (#355).
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  initAndWireSentryServer(Sentry, "auth");
}

export const onRequestError = Sentry.captureRequestError;
