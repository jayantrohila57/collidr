import "@loftlancer/env/www";
import { withServiceBasePath } from "@loftlancer/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("www", {
  output: "export" as const,
  images: { unoptimized: true },
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: ["@loftlancer/ui"],
});

export default nextConfig;
