"use client";

import { ChevronLeft } from "lucide-react";
import type React from "react";
import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Separator } from "../components/ui/separator";
import { Skeleton } from "../components/ui/skeleton";
import { layoutGapClass } from "../lib/layout-spacing";
import {
  pageHeaderActionsClass,
  pageHeaderBackClass,
  pageHeaderDescriptionClass,
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
} from "../lib/page-header-classes";
import {
  pageHeaderDescriptionGridActionWrapClass,
  pageHeaderDescriptionGridDescClass,
  pageHeaderDescriptionGridTitleClass,
  pageHeaderMetadataGridActionWrapClass,
  pageHeaderTopDescriptionGridShellClass,
  pageHeaderWithMetadataGridShellClass,
} from "../lib/page-header-grid-classes";
import { cn } from "../lib/utils";

/**
 * The one in-app page header (studio dashboard, org, project, app pages and
 * auth account settings). Rows, top to bottom:
 *   1. back · title + description · actions (h-8)
 *   2. meta (min-h-6, even when empty)
 *   3. tabs (always; a single "All" tab by default) · tabs end slot
 */
export type PageHeaderTabItem = {
  value: string;
  label: ReactNode;
  href?: string;
  disabled?: boolean;
};

type LinkLike = React.ElementType<{
  href: string;
  className?: string;
  children?: ReactNode;
  role?: string;
  "aria-selected"?: boolean;
  "aria-current"?: "page";
}>;

export const pageHeaderBackButtonClass = cn(
  pageHeaderBackClass,
  "inline-flex items-center justify-center rounded-lg border bg-background text-foreground shadow-xs/5 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
);

/** Plain back control for apps without a router-aware button. */
export function PageHeaderBackLink({
  href,
  LinkComponent = "a",
}: {
  href?: string;
  LinkComponent?: LinkLike | "a";
}) {
  const L = LinkComponent as React.ElementType;
  // Same chevron as studio's PageBackButton (AppIcon "back") so every
  // header's back control looks identical (#319).
  const icon = <ChevronLeft className="size-4" aria-hidden />;
  if (href) {
    return (
      <L
        href={href}
        className={pageHeaderBackButtonClass}
        aria-label="Back"
        title="Back"
      >
        {icon}
      </L>
    );
  }
  return (
    <button
      type="button"
      className={pageHeaderBackButtonClass}
      aria-label="Back"
      title="Back"
      onClick={() => window.history.back()}
    >
      {icon}
    </button>
  );
}

export function PageHeaderTabsRow({
  tabs,
  activeTab,
  onTabChange,
  end,
  LinkComponent = "a",
}: {
  tabs?: PageHeaderTabItem[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  end?: ReactNode;
  LinkComponent?: LinkLike | "a";
}) {
  const L = LinkComponent as React.ElementType;
  const list = tabs?.length ? tabs : [{ value: "all", label: "All" }];
  const value = activeTab ?? list[0]?.value;
  return (
    <div className={pageHeaderTabsRowClass} data-slot="page-header-tabs">
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
          return tab.href ? (
            <L
              key={tab.value}
              href={tab.href}
              role="tab"
              aria-selected={active}
              aria-current={active ? "page" : undefined}
              className={className}
            >
              {tab.label}
            </L>
          ) : (
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
      {end ? <div className={pageHeaderTabsEndClass}>{end}</div> : null}
    </div>
  );
}

function PageHeaderTitleBlock({
  title,
  titleAccessory,
  description,
  className,
}: {
  title: ReactNode;
  titleAccessory?: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-0.5", className)}>
      <div className={pageHeaderTitleRowClass}>
        <h1 className={pageHeaderTitleClass}>{title}</h1>
        {titleAccessory}
      </div>
      {typeof description === "string" ? (
        <p className={cn(pageHeaderDescriptionClass, "line-clamp-2")}>
          {description}
        </p>
      ) : (
        description
      )}
    </div>
  );
}

function PageHeaderActionsSlot({ actions }: { actions?: ReactNode }) {
  return (
    <div
      className={cn(pageHeaderActionsClass, "*:data-[slot=button]:h-8")}
      data-slot="page-header-actions"
    >
      {actions}
    </div>
  );
}

function PageHeaderWithMetadataGrid({
  back,
  title,
  titleAccessory,
  description,
  actions,
  metadata,
}: {
  back: ReactNode;
  title: ReactNode;
  titleAccessory?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  metadata: ReactNode;
}) {
  const hasBack = Boolean(back);
  const hasAction = Boolean(actions);
  const hasDescription = Boolean(description);
  const slots = { hasBack, hasAction };

  return (
    <div
      className={cn(
        layoutGapClass,
        pageHeaderWithMetadataGridShellClass(slots, hasDescription),
      )}
    >
      {hasBack ? (
        <div
          className={cn(
            "self-center [grid-area:leading]",
            hasDescription && "md:mt-1 md:self-start",
          )}
        >
          {back}
        </div>
      ) : null}
      {hasBack ? (
        <Separator
          orientation="vertical"
          className={cn(
            "hidden h-8 shrink-0 self-center [grid-area:leading-sep] md:block",
            hasDescription && "md:mt-1 md:self-start",
          )}
        />
      ) : null}

      <PageHeaderTitleBlock
        title={title}
        titleAccessory={titleAccessory}
        description={description}
        className="[grid-area:title]"
      />

      <Separator className="[grid-area:div] md:hidden" />

      <div
        className={cn(
          "min-w-0 [grid-area:meta]",
          hasDescription ? "md:mt-1 md:self-start" : "md:self-center",
        )}
        data-slot="page-header-meta"
      >
        {metadata}
      </div>

      <Separator
        orientation="vertical"
        className={cn(
          "hidden h-8 shrink-0 [grid-area:meta-sep] md:block",
          hasDescription ? "md:mt-1 md:self-start" : "md:self-center",
        )}
      />

      <div className={pageHeaderMetadataGridActionWrapClass(hasDescription)}>
        <PageHeaderActionsSlot actions={actions} />
      </div>
    </div>
  );
}

function PageHeaderTopWithDescriptionGrid({
  back,
  title,
  titleAccessory,
  description,
  actions,
}: {
  back: ReactNode;
  title: ReactNode;
  titleAccessory?: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
}) {
  const hasBack = Boolean(back);
  const hasAction = Boolean(actions);
  const slots = { hasBack, hasAction };

  return (
    <div
      className={cn(
        layoutGapClass,
        pageHeaderTopDescriptionGridShellClass(slots),
      )}
    >
      {hasBack ? (
        <div className="self-center [grid-area:leading]">{back}</div>
      ) : null}
      <PageHeaderTitleBlock
        title={title}
        titleAccessory={titleAccessory}
        className={pageHeaderDescriptionGridTitleClass(hasBack)}
      />
      <div className={pageHeaderDescriptionGridActionWrapClass(slots)}>
        <PageHeaderActionsSlot actions={actions} />
      </div>
      <div
        className={cn("min-w-0", pageHeaderDescriptionGridDescClass(hasBack))}
      >
        {description}
      </div>
    </div>
  );
}

function PageHeaderTopRow({
  back,
  title,
  titleAccessory,
  description,
  actions,
}: {
  back: ReactNode;
  title: ReactNode;
  titleAccessory?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  if (description) {
    return (
      <PageHeaderTopWithDescriptionGrid
        back={back}
        title={title}
        titleAccessory={titleAccessory}
        description={description}
        actions={actions}
      />
    );
  }

  return (
    <div className={pageHeaderTopRowClass}>
      {back}
      <PageHeaderTitleBlock
        title={title}
        titleAccessory={titleAccessory}
        className="min-w-0 flex-1"
      />
      <PageHeaderActionsSlot actions={actions} />
    </div>
  );
}

export function PageHeaderLayout({
  back,
  title,
  titleAccessory,
  description,
  actions,
  meta,
  tabs,
}: {
  back: ReactNode;
  title: ReactNode;
  titleAccessory?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  /** A rendered {@link PageHeaderTabsRow}. */
  tabs: ReactNode;
}) {
  const hasMetadata = meta != null && meta !== false;

  return (
    <header className={pageHeaderRootClass} data-slot="page-header">
      {hasMetadata ? (
        <PageHeaderWithMetadataGrid
          back={back}
          title={title}
          titleAccessory={titleAccessory}
          description={description}
          actions={actions}
          metadata={meta}
        />
      ) : (
        <>
          <PageHeaderTopRow
            back={back}
            title={title}
            titleAccessory={titleAccessory}
            description={description}
            actions={actions}
          />
          <div
            className={pageHeaderMetaRowClass}
            data-slot="page-header-meta"
          />
        </>
      )}
      {tabs}
    </header>
  );
}

/**
 * Renders children into the nearest page header's actions slot. For client
 * widgets (e.g. timeline filters) whose state lives below a server-rendered
 * header.
 */
export function PageHeaderActionsPortal({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<Element | null>(null);
  useEffect(() => {
    setTarget(document.querySelector('[data-slot="page-header-actions"]'));
  }, []);
  return target ? createPortal(children, target) : null;
}

/** Same footprint as {@link PageHeaderLayout} while data loads. */
export function PageHeaderLayoutSkeleton({
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
  const description = withDescription ? (
    <div className="flex h-4 items-center">
      <Skeleton className="h-3 w-64 max-w-full" />
    </div>
  ) : null;

  const meta = withMeta ? (
    <div className="flex min-h-6 flex-wrap items-center gap-x-4 gap-y-1">
      <Skeleton className="h-3 w-32" />
    </div>
  ) : undefined;

  return (
    <PageHeaderLayout
      back={<Skeleton className="size-8 shrink-0 rounded-md" aria-hidden />}
      title={<Skeleton className="h-5 w-40 max-w-full" aria-hidden />}
      description={description}
      actions={
        withAction ? (
          <Skeleton className="h-8 w-28 rounded-md" aria-hidden />
        ) : undefined
      }
      meta={meta}
      tabs={
        <div className={pageHeaderTabsRowClass} aria-hidden>
          <div className={pageHeaderTabsListClass}>
            {Array.from({ length: tabCount }, (_, i) => (
              <div
                key={`tab-skeleton-${String(i)}`}
                className="flex h-9 items-center px-2.5"
              >
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
