import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

export const dynamic = "force-static";

const siteUrl =
  process.env.NEXT_PUBLIC_DOCS_URL?.replace(/\/$/, "") ??
  "https://loftlancer.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const docPages = source.getPages().map((page) => ({
    url: `${siteUrl}${page.url}`,
    lastModified: new Date(),
  }));

  return [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/docs`, lastModified: new Date() },
    ...docPages,
  ];
}
