import { withSentryConfig } from "@sentry/nextjs/config";
import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const docsBasePath = process.env.NEXT_BASE_PATH ?? "";

const config: NextConfig = {
  output: "export" as const,
  images: { unoptimized: true },
  reactStrictMode: true,
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: ["@loftlancer/ui"],
  ...(docsBasePath ? { basePath: docsBasePath } : {}),
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/favicon/favicon.ico",
        permanent: false,
      },
    ];
  },
};

const withMDX = createMDX();

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

export default withSentryConfig(withMDX(config), sentryBuildOptions);
