import "@env-manager/env/server";
import "@env-manager/env/mcp-app";
import { withServiceBasePath } from "@env-manager/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("mcp", {
  typedRoutes: true,
});

export default nextConfig;
