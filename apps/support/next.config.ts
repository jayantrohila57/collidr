import { withServiceBasePath } from "@env-manager/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("support", {
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: [
    "@env-manager/ui",
    "@env-manager/api",
    "@env-manager/auth-client",
  ],
});

export default nextConfig;
