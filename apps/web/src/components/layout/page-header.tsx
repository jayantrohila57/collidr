"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PageBackButton } from "@/components/layout/page-back-button";
import { Separator } from "@/components/ui/separator";
import {
  layoutPageHeaderRowClass,
  layoutPageTitleClass,
} from "@/lib/layout-spacing";
import {
  getPageBackFallback,
  getPageBackHref,
  isDashboardRootPath,
  type PageBackHref,
} from "@/lib/page-back";
import { cn } from "@/lib/utils";

export type PageHeaderBackProp =
  | false
  | "auto"
  | PageBackHref
  | { href?: PageBackHref | null; useHistory?: boolean };

type ResolvedBack = {
  href?: PageBackHref | null;
  fallbackHref: PageBackHref;
  useHistory: boolean;
};

function resolveBack(
  back: PageHeaderBackProp | undefined,
  pathname: string,
): ResolvedBack | null {
  if (back === false) return null;

  if (back === "auto" || back === undefined) {
    if (isDashboardRootPath(pathname)) {
      return {
        fallbackHref: getPageBackFallback(pathname),
        useHistory: true,
      };
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

  if (back.useHistory) {
    const fallback =
      back.href ??
      getPageBackFallback(pathname) ??
      ("/dashboard" as PageBackHref);
    return {
      href: back.href ?? null,
      fallbackHref: fallback,
      useHistory: true,
    };
  }

  if (back.href) {
    return { href: back.href, fallbackHref: back.href, useHistory: false };
  }

  return {
    fallbackHref: getPageBackFallback(pathname),
    useHistory: true,
  };
}

export function PageHeader({
  title,
  titleAccessory,
  description,
  action,
  back = "auto",
}: {
  title: string;
  titleAccessory?: ReactNode;
  description?: string;
  action?: ReactNode;
  back?: PageHeaderBackProp;
}) {
  const pathname = usePathname() ?? "";
  const resolved = resolveBack(back, pathname);

  return (
    <div className={layoutPageHeaderRowClass}>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {resolved ? (
          <>
            <PageBackButton
              href={resolved.href}
              fallbackHref={resolved.fallbackHref}
              useHistory={resolved.useHistory}
            />
            <Separator
              orientation="vertical"
              className="my-auto h-8 shrink-0"
            />
          </>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className={cn(layoutPageTitleClass, "truncate")}>{title}</h1>
            {titleAccessory}
          </div>
          {description ? (
            <p className="line-clamp-2 pb-0.5 text-muted-foreground text-xs">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** @deprecated Use `PageHeader` — kept for existing imports. */
export const PageTitleRow = PageHeader;
