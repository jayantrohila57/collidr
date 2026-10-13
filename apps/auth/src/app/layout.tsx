import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import { Providers } from "@/components/providers";

import "../index.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Sign in · Collidr",
  description: "Authentication for Collidr platform apps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`font-sans ${inter.variable} ${geistMono.variable}`}
    >
      <body className="relative min-h-svh bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
