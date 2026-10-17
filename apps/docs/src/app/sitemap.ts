import type { MetadataRoute } from "next";
import { publicRoutes, siteUrl } from "@/lib/seo";
import { source } from "@/lib/source";

export const dynamic = "force-static";

/**
 * Public, indexable URLs only: the landing and marketing pages, /privacy,
 * /terms and every docs page. Studio and auth are private and never listed;
 * placeholder /legal/* pages are noindex until their copy is reviewed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const indexable = publicRoutes.filter((path) => !path.startsWith("/legal/"));
  const pages = indexable.map((path) => ({
    url: path === "/" ? siteUrl : `${siteUrl}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
  const docPages = source.getPages().map((page) => ({
    url: `${siteUrl}${page.url}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: page.url === "/docs" ? 0.9 : 0.6,
  }));
  return [...pages, ...docPages];
}
