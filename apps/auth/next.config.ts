import "@collidr/env/server";
import "@collidr/env/auth-app";
import { withServiceBasePath } from "@collidr/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("auth", {
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: ["@collidr/ui"],
});

export default nextConfig;
