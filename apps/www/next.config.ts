import "@env-manager/env/www";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: ["@env-manager/ui"],
};

export default nextConfig;
