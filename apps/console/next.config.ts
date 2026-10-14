import { withServiceBasePath } from "@collidr/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("console", {
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
