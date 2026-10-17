import type { MetadataRoute } from "next";

/** Studio is private; the public robots.txt at loftlancer.com also disallows it. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
