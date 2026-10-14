import "@loftlancer/env/server";
import "@loftlancer/env/mcp-app";
import { withServiceBasePath } from "@loftlancer/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("mcp", {
  typedRoutes: true,
  reactCompiler: true,
});

export default nextConfig;
