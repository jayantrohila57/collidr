import type { Route } from "next";
import Link from "next/link";

export function SkipLink() {
  return (
    <Link
      href={"#main-content" as Route}
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      Skip to main content
    </Link>
  );
}
