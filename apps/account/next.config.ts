import "@env-manager/env/server";
import "@env-manager/env/account";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,
  reactCompiler: true,
};

export default nextConfig;
