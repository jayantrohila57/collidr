import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: [
    "@env-manager/ui",
    "@env-manager/api",
    "@env-manager/auth-client",
  ],
};

export default nextConfig;
