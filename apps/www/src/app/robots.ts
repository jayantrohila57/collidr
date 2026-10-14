import type { MetadataRoute } from "next";

import { getWwwSiteUrl } from "@/lib/site-metadata";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = getWwwSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
