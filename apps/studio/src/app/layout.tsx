import type { Metadata } from "next";

import { Geist_Mono, Inter } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";
import { generateMetadata as generateSiteMetadata } from "@/lib/siteConfig";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = generateSiteMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", inter.variable, geistMono.variable)}
    >
      <body className="relative antialiased">
        <div className="relative isolate flex min-h-svh min-w-0 flex-col">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
