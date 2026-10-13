import "@collidr/env/server";
import "@collidr/env/studio";
import { withServiceBasePath } from "@collidr/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("studio", {
  typedRoutes: true,
  reactCompiler: true,
});

export default nextConfig;
