import "@env-manager/env/server";
import "@env-manager/env/account";
import { withServiceBasePath } from "@env-manager/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("account", {
  typedRoutes: false,
  reactCompiler: true,
});

export default nextConfig;
