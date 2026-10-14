import "@loftlancer/env/server";
import "@loftlancer/env/studio";
import { withServiceBasePath } from "@loftlancer/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("studio", {
  typedRoutes: true,
  reactCompiler: true,
});

export default nextConfig;
