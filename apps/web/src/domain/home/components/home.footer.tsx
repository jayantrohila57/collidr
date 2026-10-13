"use client";

import { Heart, Shield } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/siteConfig";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="py-8 md:py-10">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-5">
          {/* Brand Section */}
          <div className="xl:col-span-2">
            <div className="mb-4 flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">{siteConfig.name}</span>
              <Badge variant="secondary" className="ms-2">
                Beta
              </Badge>
            </div>
            <p className="max-w-md text-muted-foreground text-xs">
              {siteConfig.description}
            </p>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} {siteConfig.name}. All rights
              reserved.
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 fill-current text-red-500" />
              <span>by</span>
              <Link
                href={siteConfig.author.url}
                className="transition-colors hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                {siteConfig.author.name}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
