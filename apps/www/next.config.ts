import "@collidr/env/www";
import { withServiceBasePath } from "@collidr/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("www", {
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: ["@collidr/ui"],
});

export default nextConfig;
