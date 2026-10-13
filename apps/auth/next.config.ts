import "@env-manager/env/server";
import "@env-manager/env/auth-app";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: ["@env-manager/ui"],
};

export default nextConfig;
