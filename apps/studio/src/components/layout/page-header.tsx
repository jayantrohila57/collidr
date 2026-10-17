"use client";

import {
  pageHeaderMetaRowClass,
  pageHeaderRootClass,
  pageHeaderTabsRowClass,
  pageHeaderTopRowClass,
} from "@loftlancer/ui/page-header-classes";
import {
  PageHeaderLayout,
  PageHeaderTabsRow,
} from "@loftlancer/ui/patterns/page-header";
import { Skeleton } from "@loftlancer/ui/skeleton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PageBackButton } from "@/components/layout/page-back-button";
import { PageHeaderDescription } from "@/components/layout/page-header-description";
import {
  type PageHeaderBackProp,
  resolvePageHeaderBack,
} from "@/lib/page-header-back";

export type { PageHeaderBackProp };

/**
 * `false` hides the back control; `"auto"` resolves from the URL (or history);
 * a string or object pins the target.
 */

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

const DEFAULT_TABS: PageHeaderTab[] = [{ value: "all", label: "All" }];

const rootClass = pageHeaderRootClass;
const topRowClass = pageHeaderTopRowClass;
const tabsRowClass = pageHeaderTabsRowClass;

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
  /** Badges, links, key/value data under the title row. Height is fixed. */
  meta?: ReactNode;
  back?: PageHeaderBackProp;
} & PageHeaderTabsProps) {
  const pathname = usePathname() ?? "";
  const resolved = resolvePageHeaderBack(back, pathname);
  return (
    <PageHeaderLayout
      back={
        resolved ? (
          <PageBackButton
            href={resolved.href}
            fallbackHref={resolved.fallbackHref}
            useHistory={resolved.useHistory}
          />
        ) : null
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
  withBack = true,
  tabCount = 1,
}: {
  withDescription?: boolean;
  withAction?: boolean;
  withBack?: boolean;
  tabCount?: number;
}) {
  return (
    <div className={rootClass} aria-hidden data-slot="page-header-skeleton">
      <div className={topRowClass}>
        {withBack ? <Skeleton className="size-8 shrink-0 rounded-md" /> : null}
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
      <div className={pageHeaderMetaRowClass(withBack)}>
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
