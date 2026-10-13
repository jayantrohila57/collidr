import "@env-manager/env/server";
import "@env-manager/env/mcp-app";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
};

export default nextConfig;
