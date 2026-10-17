import type { PageBackHref } from "@/lib/page-back";
import {
  getPageBackFallback,
  getPageBackHref,
  isDashboardRootPath,
} from "@/lib/page-back";

export type PageHeaderBackProp =
  | false
  | "auto"
  | PageBackHref
  | { href?: PageBackHref | null; useHistory?: boolean };

export type ResolvedPageHeaderBack = {
  href?: PageBackHref | null;
  fallbackHref: PageBackHref;
  useHistory: boolean;
};

/** Resolves `PageHeader` `back` prop; `false` hides the back control (#77). */
export function resolvePageHeaderBack(
  back: PageHeaderBackProp | undefined,
  pathname: string,
): ResolvedPageHeaderBack | null {
  if (back === false) return null;

  if (back === "auto" || back === undefined) {
    if (isDashboardRootPath(pathname)) {
      return null;
    }
    const href = getPageBackHref(pathname);
    if (href) {
      return { href, fallbackHref: href, useHistory: false };
    }
    return {
      fallbackHref: getPageBackFallback(pathname),
      useHistory: true,
    };
  }

  if (typeof back === "string") {
    return { href: back, fallbackHref: back, useHistory: false };
  }

  const fallback = back.href ?? getPageBackFallback(pathname);
  return {
    href: back.href ?? null,
    fallbackHref: fallback,
    useHistory: Boolean(back.useHistory) || !back.href,
  };
}
