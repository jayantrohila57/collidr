import "@loftlancer/env/server";
import "@loftlancer/env/studio";
import { withServiceBasePath } from "@loftlancer/env/next-service-base-path";
import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("studio", {
  typedRoutes: true,
  reactCompiler: true,
});

/**
 * Sentry source-map upload (#354). Uploads only when SENTRY_AUTH_TOKEN is set
 * (Vercel production); an upload failure logs and never fails the build.
 */
const sentryBuildOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  telemetry: false,
  buildTimeInstrumentation: false,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  errorHandler: (err: Error) => {
    console.warn(`[sentry] source-map upload skipped: ${err.message}`);
  },
};

export default withSentryConfig(nextConfig, sentryBuildOptions);
