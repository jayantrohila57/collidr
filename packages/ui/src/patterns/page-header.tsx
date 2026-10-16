"use client";

import { ChevronLeft } from "lucide-react";
import type React from "react";
import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
import { cn } from "../lib/utils";

/**
 * The one in-app page header (studio dashboard, org, project, app pages and
 * auth account settings). Rows, top to bottom:
 *   1. back · title + description · actions (h-8)
 *   2. meta (fixed h-6, even when empty)
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
  return (
    <header className={pageHeaderRootClass} data-slot="page-header">
      <div className={pageHeaderTopRowClass}>
        {back}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
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
        {/* Always rendered so pages with and without actions line up. */}
        <div
          className={cn(pageHeaderActionsClass, "*:data-[slot=button]:h-8")}
          data-slot="page-header-actions"
        >
          {actions}
        </div>
      </div>
      <div className={pageHeaderMetaRowClass} data-slot="page-header-meta">
        {meta}
      </div>
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
