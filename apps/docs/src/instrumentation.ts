import { initAndWireSentryServer } from "@loftlancer/logger/sentry-instrument";
import * as Sentry from "@sentry/nextjs";

// Static export: this runs in dev only; production docs logs are browser-only (#355).
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  initAndWireSentryServer(Sentry, "docs");
}

export const onRequestError = Sentry.captureRequestError;
