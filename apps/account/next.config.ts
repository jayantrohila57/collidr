import "@collidr/env/server";
import "@collidr/env/account";
import { withServiceBasePath } from "@collidr/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("account", {
  typedRoutes: true,
  reactCompiler: true,
});

export default nextConfig;
