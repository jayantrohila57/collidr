"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PageBackButton } from "@/components/layout/page-back-button";
import {
  layoutPageHeaderRowClass,
  layoutPageTitleClass,
} from "@/lib/layout-spacing";
import { getPageBackHref, type PageBackHref } from "@/lib/page-back";
import { cn } from "@/lib/utils";

export type PageHeaderBackProp =
  | false
  | "auto"
  | PageBackHref
  | { href?: PageBackHref | null; useHistory?: boolean };

function resolveBack(
  back: PageHeaderBackProp | undefined,
  pathname: string,
): { href?: PageBackHref | null; useHistory: boolean } | null {
  if (back === false) return null;
  if (back === "auto" || back === undefined) {
    const href = getPageBackHref(pathname);
    return href ? { href, useHistory: false } : null;
  }
  if (typeof back === "string") {
    return { href: back, useHistory: false };
  }
  if (back.useHistory) {
    return { href: back.href ?? null, useHistory: true };
  }
  return back.href
    ? { href: back.href, useHistory: false }
    : { useHistory: true };
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
      <div className="flex min-w-0 flex-1 items-start gap-2">
        {resolved ? (
          <PageBackButton
            href={resolved.useHistory && !resolved.href ? null : resolved.href}
            className="mt-0.5"
          />
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
      {action ? <div className="mt-0.5 shrink-0">{action}</div> : null}
    </div>
  );
}

/** @deprecated Use `PageHeader` — kept for existing imports. */
export const PageTitleRow = PageHeader;
