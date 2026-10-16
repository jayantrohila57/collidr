import "@loftlancer/env/server";
import "@loftlancer/env/studio";
import { withServiceBasePath } from "@loftlancer/env/next-service-base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = withServiceBasePath("studio", {
  typedRoutes: true,
  reactCompiler: true,
  // Apps system (#245): short project URLs. Old links keep working.
  async redirects() {
    const slug = ":slug((?!new$)[^/]+)";
    return [
      {
        source: `/dashboard/projects/${slug}/environments`,
        destination: "/p/:slug/env",
        permanent: true,
      },
      {
        source: `/dashboard/projects/${slug}/:rest*`,
        destination: "/p/:slug/:rest*",
        permanent: true,
      },
      {
        source: `/dashboard/projects/${slug}`,
        destination: "/p/:slug",
        permanent: true,
      },
    ];
  },
});

export default nextConfig;
