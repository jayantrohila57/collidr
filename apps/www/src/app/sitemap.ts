import type { MetadataRoute } from "next";

import { getWwwSiteUrl } from "@/lib/site-metadata";

export const dynamic = "force-static";

const paths = [
  "",
  "/features",
  "/pricing",
  "/about",
  "/changelog",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getWwwSiteUrl();
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
}
