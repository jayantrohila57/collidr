import { withServiceBasePath } from "@collidr/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("support", {
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: [
    "@collidr/ui",
    "@collidr/api",
    "@collidr/auth-client",
  ],
});

export default nextConfig;
