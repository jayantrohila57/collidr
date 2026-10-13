import "@env-manager/env/www";
import { withServiceBasePath } from "@env-manager/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("www", {
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: ["@env-manager/ui"],
});

export default nextConfig;
