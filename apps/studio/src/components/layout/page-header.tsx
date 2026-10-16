"use client";

import {
  pageHeaderActionsClass,
  pageHeaderMetaRowClass,
  pageHeaderRootClass,
  pageHeaderTabActiveClass,
  pageHeaderTabClass,
  pageHeaderTabInactiveClass,
  pageHeaderTabsEndClass,
  pageHeaderTabsListClass,
  pageHeaderTabsRowClass,
  pageHeaderTitleClass,
  pageHeaderTitleRowClass,
  pageHeaderTopRowClass,
} from "@loftlancer/ui/page-header-classes";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PageBackButton } from "@/components/layout/page-back-button";
import { PageHeaderDescription } from "@/components/layout/page-header-description";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getPageBackFallback,
  getPageBackHref,
  type PageBackHref,
} from "@/lib/page-back";
import { cn } from "@/lib/utils";

/**
 * Back is always rendered. `false` and `"auto"` both resolve to the logical
 * parent route (or history back with a parent fallback); a string or object
 * pins the target.
 */
export type PageHeaderBackProp =
  | false
  | "auto"
  | PageBackHref
  | { href?: PageBackHref | null; useHistory?: boolean };

export type PageHeaderTab = {
  value: string;
  label: ReactNode;
  /** Link tabs navigate (cmd-click opens a new tab). */
  href?: string;
  disabled?: boolean;
};

export type PageHeaderTabsProps = {
  /** Defaults to a single "All" tab. */
  tabs?: PageHeaderTab[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  /** Right side of the tabs row (filters, view toggles…). */
  tabsEnd?: ReactNode;
};

type ResolvedBack = {
  href?: PageBackHref | null;
  fallbackHref: PageBackHref;
  useHistory: boolean;
};

const DEFAULT_TABS: PageHeaderTab[] = [{ value: "all", label: "All" }];

function resolveBack(
  back: PageHeaderBackProp | undefined,
  pathname: string,
): ResolvedBack {
  if (back === false || back === "auto" || back === undefined) {
    const href = getPageBackHref(pathname);
    if (href) return { href, fallbackHref: href, useHistory: false };
    return { fallbackHref: getPageBackFallback(pathname), useHistory: true };
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

const rootClass = pageHeaderRootClass;
const topRowClass = pageHeaderTopRowClass;
const metaRowClass = pageHeaderMetaRowClass;
const tabsRowClass = pageHeaderTabsRowClass;
const actionsClass = cn(pageHeaderActionsClass, "*:data-[slot=button]:h-8");

export function PageHeaderTabs({
  tabs,
  activeTab,
  onTabChange,
  tabsEnd,
}: PageHeaderTabsProps) {
  const list = tabs?.length ? tabs : DEFAULT_TABS;
  const value = activeTab ?? list[0]?.value;
  return (
    <div className={tabsRowClass} data-slot="page-header-tabs">
      <div
        role="tablist"
        aria-label="Sections"
        className={pageHeaderTabsListClass}
      >
        {list.map((tab) => {
          const active = tab.value === value;
          const className = cn(
            pageHeaderTabClass,
            active ? pageHeaderTabActiveClass : pageHeaderTabInactiveClass,
            tab.disabled && "pointer-events-none opacity-60",
          );
          if (tab.href) {
            return (
              <Link
                key={tab.value}
                href={tab.href as Route}
                role="tab"
                aria-selected={active}
                aria-current={active ? "page" : undefined}
                className={className}
              >
                {tab.label}
              </Link>
            );
          }
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={tab.disabled}
              className={className}
              onClick={() => onTabChange?.(tab.value)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabsEnd ? <div className={pageHeaderTabsEndClass}>{tabsEnd}</div> : null}
    </div>
  );
}

export function PageHeader({
  title,
  titleAccessory,
  description,
  action,
  metadata,
  meta,
  back = "auto",
  tabs,
  activeTab,
  onTabChange,
  tabsEnd,
}: {
  title: string;
  titleAccessory?: ReactNode;
  description?: string;
  action?: ReactNode;
  /** @deprecated use `meta` */
  metadata?: ReactNode;
  /** Badges, links, key/value data under the title row. Height is fixed. */
  meta?: ReactNode;
  back?: PageHeaderBackProp;
} & PageHeaderTabsProps) {
  const pathname = usePathname() ?? "";
  const resolved = resolveBack(back, pathname);
  const metaContent = meta ?? metadata;

  return (
    <header className={rootClass} data-slot="page-header">
      <div className={topRowClass}>
        <PageBackButton
          href={resolved.href}
          fallbackHref={resolved.fallbackHref}
          useHistory={resolved.useHistory}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className={pageHeaderTitleRowClass}>
            <h1 className={pageHeaderTitleClass}>{title}</h1>
            {titleAccessory}
          </div>
          {description ? <PageHeaderDescription text={description} /> : null}
        </div>
        {action ? (
          <div className={actionsClass} data-slot="page-header-actions">
            {action}
          </div>
        ) : null}
      </div>
      <div className={metaRowClass} data-slot="page-header-meta">
        {metaContent}
      </div>
      <PageHeaderTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        tabsEnd={tabsEnd}
      />
    </header>
  );
}

/** Same footprint as {@link PageHeader} while data loads. */
export function PageHeaderSkeleton({
  withDescription = true,
  withAction = true,
  tabCount = 1,
}: {
  withDescription?: boolean;
  withAction?: boolean;
  tabCount?: number;
}) {
  return (
    <div className={rootClass} aria-hidden data-slot="page-header-skeleton">
      <div className={topRowClass}>
        <Skeleton className="size-8 shrink-0 rounded-md" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex h-8 items-center">
            <Skeleton className="h-5 w-40" />
          </div>
          {withDescription ? (
            <div className="flex h-4 items-center">
              <Skeleton className="h-3 w-64 max-w-full" />
            </div>
          ) : null}
        </div>
        {withAction ? (
          <Skeleton className="h-8 w-28 shrink-0 rounded-md" />
        ) : null}
      </div>
      <div className={metaRowClass}>
        <Skeleton className="h-3 w-32" />
      </div>
      <div className={tabsRowClass}>
        <div className="flex h-9 items-center gap-3 px-2.5">
          {Array.from({ length: tabCount }, (_, i) => (
            <Skeleton key={`tab-${String(i)}`} className="h-3 w-12" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use `PageHeader` — kept for existing imports. */
export const PageTitleRow = PageHeader;
