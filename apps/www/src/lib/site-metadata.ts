import { marketingSiteConfig } from "@collidr/ui/marketing";
import type { Metadata } from "next";

const defaultWwwUrl = "https://collidr.vercel.app";

export function getWwwSiteUrl(): string {
  return process.env.NEXT_PUBLIC_WWW_URL ?? defaultWwwUrl;
}

export function generateWwwMetadata(): Metadata {
  const siteUrl = getWwwSiteUrl();
  return {
    title: {
      default: marketingSiteConfig.name,
      template: `%s | ${marketingSiteConfig.name}`,
    },
    description: marketingSiteConfig.description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      title: marketingSiteConfig.name,
      description: marketingSiteConfig.description,
      siteName: marketingSiteConfig.name,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
