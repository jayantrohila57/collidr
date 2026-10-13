import "@env-manager/env/server";
import "@env-manager/env/studio";
import { withServiceBasePath } from "@env-manager/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("studio", {
  typedRoutes: true,
  reactCompiler: true,
});

export default nextConfig;
