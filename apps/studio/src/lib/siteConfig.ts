import type { Metadata } from "next";

export const siteConfig = {
  name: "Loftlancer",
  description:
    "Loftlancer is a developer-first system to securely manage environment variables, secrets, and third-party credentials across multiple repositories and environments (dev, staging, prod). It acts as a single source of truth and integrates with local development and CI/CD workflows.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://loftlancer.com/studio",
  ogImage: "/og-image.png",
  links: {
    twitter: "https://twitter.com/jayant_rohila",
    github: "https://github.com/jayantrohila57/loftlancer",
  },
  author: {
    name: "Jayant Rohila",
    email: "jrohila55@gmail.com",
    url: "https://jayantrohila.com",
  },
  keywords: [
    "environment variables",
    "secrets management",
    "devops",
    "ci/cd",
    "developer tools",
    "configuration management",
    "security",
    "env files",
  ] as string[],
} as const;

export type SiteConfig = typeof siteConfig;

/** One document title for every studio 404 (#317). */
export const NOT_FOUND_DOCUMENT_TITLE = `Not found · ${siteConfig.name}`;

export function generateMetadata(): Metadata {
  return {
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [
      {
        name: siteConfig.author.name,
        url: siteConfig.author.url,
      },
    ],
    creator: siteConfig.author.name,
    publisher: siteConfig.author.name,
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteConfig.url,
      title: siteConfig.name,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} OG Image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.description,
      images: [siteConfig.ogImage],
      creator: siteConfig.links.twitter?.split("/").pop(),
    },
    // Studio is a private, signed-in app: never indexed (#352).
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  };
}
