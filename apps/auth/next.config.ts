import "@env-manager/env/server";
import "@env-manager/env/auth-app";
import { withServiceBasePath } from "@env-manager/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("auth", {
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: ["@env-manager/ui"],
});

export default nextConfig;
