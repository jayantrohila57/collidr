import { createMDX } from "fumadocs-mdx/next";

const docsBasePath =
  process.env.NEXT_BASE_PATH ??
  (process.env.VERCEL_SERVICES === "1" ? "/docs" : "");

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  typedRoutes: false,
  ...(docsBasePath ? { basePath: docsBasePath } : {}),
};

const withMDX = createMDX();

export default withMDX(config);
