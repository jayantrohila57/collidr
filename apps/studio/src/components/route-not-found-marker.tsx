"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { setRouteNotFound } from "@/lib/route-not-found-store";
import { NOT_FOUND_DOCUMENT_TITLE } from "@/lib/siteConfig";

/**
 * Rendered by the shell not-found page: marks the path as a 404 for the
 * breadcrumb and sets one consistent document title (nested not-found files
 * can't export metadata, and the route's own metadata may echo the slug).
 */
export function RouteNotFoundMarker({ depth }: { depth: number }) {
  const pathname = usePathname() ?? "/";
  useEffect(() => {
    setRouteNotFound({ pathname, depth });
    document.title = NOT_FOUND_DOCUMENT_TITLE;
    return () => setRouteNotFound(null);
  }, [pathname, depth]);
  return null;
}
