import { rootFontClassName } from "@loftlancer/ui/fonts";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";

import Providers from "@/components/providers";

import "../index.css";

export const metadata: Metadata = {
  // Same "Page | Loftlancer" titles as studio (#328).
  title: {
    default: "Loftlancer",
    template: "%s | Loftlancer",
  },
  description: "Authentication for Loftlancer platform apps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={rootFontClassName}>
      <body className="relative min-h-svh bg-background antialiased">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
