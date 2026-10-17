"use client";

import {
  PageHeaderLayout,
  PageHeaderLayoutSkeleton,
  PageHeaderTabsRow,
} from "@loftlancer/ui/patterns/page-header";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PageBackButton } from "@/components/layout/page-back-button";
import { PageHeaderDescription } from "@/components/layout/page-header-description";
import {
  getPageBackFallback,
  getPageBackHref,
  type PageBackHref,
} from "@/lib/page-back";

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

export function PageHeaderTabs({
  tabs,
  activeTab,
  onTabChange,
  tabsEnd,
}: PageHeaderTabsProps) {
  return (
    <PageHeaderTabsRow
      tabs={tabs?.length ? tabs : DEFAULT_TABS}
      activeTab={activeTab}
      onTabChange={onTabChange}
      end={tabsEnd}
      LinkComponent={Link as never}
    />
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
  /** Badges, links, key/value data under the title row (min-h-6, may wrap). */
  meta?: ReactNode;
  back?: PageHeaderBackProp;
} & PageHeaderTabsProps) {
  const pathname = usePathname() ?? "";
  const resolved = resolveBack(back, pathname);
  return (
    <PageHeaderLayout
      back={
        <PageBackButton
          href={resolved.href}
          fallbackHref={resolved.fallbackHref}
          useHistory={resolved.useHistory}
        />
      }
      title={title}
      titleAccessory={titleAccessory}
      description={
        description ? <PageHeaderDescription text={description} /> : null
      }
      actions={action}
      meta={meta ?? metadata}
      tabs={
        <PageHeaderTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          tabsEnd={tabsEnd}
        />
      }
    />
  );
}

/** Same footprint as {@link PageHeader} while data loads. */
export function PageHeaderSkeleton({
  withDescription = true,
  withAction = true,
  withMeta = false,
  tabCount = 1,
}: {
  withDescription?: boolean;
  withAction?: boolean;
  withMeta?: boolean;
  tabCount?: number;
}) {
  return (
    <div aria-hidden data-slot="page-header-skeleton">
      <PageHeaderLayoutSkeleton
        withDescription={withDescription}
        withAction={withAction}
        withMeta={withMeta}
        tabCount={tabCount}
      />
    </div>
  );
}

/** @deprecated Use `PageHeader` — kept for existing imports. */
export const PageTitleRow = PageHeader;
