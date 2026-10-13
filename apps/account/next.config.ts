import "@collidr/env/server";
import "@collidr/env/account";
import { withServiceBasePath } from "@collidr/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("account", {
  typedRoutes: false,
  reactCompiler: true,
});

export default nextConfig;
