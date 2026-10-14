import "@collidr/env/server";
import "@collidr/env/auth-app";
import "@collidr/env/account";
import { withServiceBasePath } from "@collidr/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("auth", {
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: ["@collidr/ui", "@collidr/api", "@collidr/auth-client"],
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/favicon/favicon.ico",
        permanent: false,
      },
    ];
  },
});

export default nextConfig;
