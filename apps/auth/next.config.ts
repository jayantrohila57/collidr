import "@loftlancer/env/server";
import "@loftlancer/env/auth-app";
import "@loftlancer/env/account";
import { withServiceBasePath } from "@loftlancer/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("auth", {
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: ["@loftlancer/ui", "@loftlancer/api", "@loftlancer/auth-client"],
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
