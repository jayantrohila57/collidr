import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Sentry stays off until NEXT_PUBLIC_SENTRY_DSN exists (#339).
if (dsn) {
  Sentry.init({
    dsn,
    // Same release name as the server and the source-map upload (#354).
    release: `loftlancer@${process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0"}`,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    initialScope: { tags: { app: "docs" } },
    tracesSampleRate: 0.1,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
