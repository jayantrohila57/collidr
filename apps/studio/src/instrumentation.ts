import { initAndWireSentryServer } from "@loftlancer/logger/sentry-instrument";
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  initAndWireSentryServer(Sentry, "studio");
}

export const onRequestError = Sentry.captureRequestError;
