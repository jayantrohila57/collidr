import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const docsBasePath =
  process.env.NEXT_BASE_PATH ??
  (process.env.VERCEL_SERVICES === "1" ? "/docs" : "");

const config: NextConfig = {
  output: "export" as const,
  images: { unoptimized: true },
  reactStrictMode: true,
  typedRoutes: true,
  reactCompiler: true,
  ...(docsBasePath ? { basePath: docsBasePath } : {}),
};

const withMDX = createMDX();

export default withMDX(config);
