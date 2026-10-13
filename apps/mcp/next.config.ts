import "@collidr/env/server";
import "@collidr/env/mcp-app";
import { withServiceBasePath } from "@collidr/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("mcp", {
  typedRoutes: true,
});

export default nextConfig;
