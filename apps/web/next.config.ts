import "@env-manager/env/web";
import { withServiceBasePath } from "@env-manager/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("web", {
  typedRoutes: true,
  reactCompiler: true,
});

export default nextConfig;
