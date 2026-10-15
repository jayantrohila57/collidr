import "@loftlancer/env/server";
import "@loftlancer/env/account";
import { withServiceBasePath } from "@loftlancer/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("account", {
  typedRoutes: true,
  reactCompiler: true,
});

export default nextConfig;
