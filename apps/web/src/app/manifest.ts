import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Env Manager",
    short_name: "Env Manager",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#5EA500",
    scope: "/",
    id: "env-manager-pwa",
    icons: [
      {
        src: "/favicon/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/favicon/screenshot-wide.png",
        sizes: "1200x630",
        type: "image/png",
        form_factor: "wide",
        label: "env-manager dashboard",
      },
      {
        src: "/favicon/screenshot-narrow.png",
        sizes: "1024x1536",
        type: "image/png",
        form_factor: "narrow",
        label: "env-manager dashboard mobile",
      },
    ],
    protocol_handlers: [
      {
        protocol: "web+env",
        url: "/handle-protocol?protocol=%s",
      },
      {
        protocol: "web+config",
        url: "/handle-protocol?protocol=%s",
      },
    ],
  };
}
