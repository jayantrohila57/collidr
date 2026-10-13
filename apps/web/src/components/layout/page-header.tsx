"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PageBackButton } from "@/components/layout/page-back-button";
import { PageHeaderDescription } from "@/components/layout/page-header-description";
import { Separator } from "@/components/ui/separator";
import { layoutPageTitleClass } from "@/lib/layout-spacing";
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

function TitleBlock({
  title,
  titleAccessory,
  description,
  className,
}: {
  title: string;
  titleAccessory?: ReactNode;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <h1 className={cn(layoutPageTitleClass, "truncate")}>{title}</h1>
        {titleAccessory}
      </div>
      {description ? <PageHeaderDescription text={description} /> : null}
    </div>
  );
}

function PageHeaderSimple({
  resolved,
  title,
  titleAccessory,
  description,
  action,
}: {
  resolved: ResolvedBack | null;
  title: string;
  titleAccessory?: ReactNode;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 items-center justify-between gap-2 py-4 md:py-5",
      )}
    >
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
              className="my-auto h-8 shrink-0 px-px"
            />
          </>
        ) : null}
        <TitleBlock
          title={title}
          titleAccessory={titleAccessory}
          description={description}
        />
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function PageHeaderWithMetadata({
  resolved,
  title,
  titleAccessory,
  description,
  metadata,
  action,
}: {
  resolved: ResolvedBack | null;
  title: string;
  titleAccessory?: ReactNode;
  description?: string;
  metadata: ReactNode;
  action?: ReactNode;
}) {
  const hasBack = Boolean(resolved);
  const hasAction = Boolean(action);

  const mobileCols = hasBack
    ? hasAction
      ? "grid-cols-[auto_auto_minmax(0,1fr)_auto]"
      : "grid-cols-[auto_auto_minmax(0,1fr)]"
    : hasAction
      ? "grid-cols-[minmax(0,1fr)_auto]"
      : "grid-cols-1";

  const mobileAreas = hasBack
    ? hasAction
      ? "[grid-template-areas:'leading_leading-sep_title_action'_'div_div_div_div'_'meta_meta_meta_meta']"
      : "[grid-template-areas:'leading_leading-sep_title'_'div_div_div'_'meta_meta_meta']"
    : hasAction
      ? "[grid-template-areas:'title_action'_'div_div'_'meta_meta']"
      : "[grid-template-areas:'title'_'div'_'meta']";

  const desktopCols = hasBack
    ? hasAction
      ? "md:grid-cols-[auto_auto_minmax(0,1fr)_auto_auto_auto]"
      : "md:grid-cols-[auto_auto_minmax(0,1fr)_auto_auto]"
    : hasAction
      ? "md:grid-cols-[minmax(0,1fr)_auto_auto_auto]"
      : "md:grid-cols-[minmax(0,1fr)_auto_auto]";

  const desktopAreas = hasBack
    ? hasAction
      ? "md:[grid-template-areas:'leading_leading-sep_title_meta-sep_meta_action']"
      : "md:[grid-template-areas:'leading_leading-sep_title_meta-sep_meta']"
    : hasAction
      ? "md:[grid-template-areas:'title_meta-sep_meta_action']"
      : "md:[grid-template-areas:'title_meta-sep_meta']";

  return (
    <div
      className={cn(
        "grid w-full min-w-0 gap-x-6 gap-y-2 py-4 md:py-5",
        mobileCols,
        mobileAreas,
        desktopCols,
        desktopAreas,
        description ? "md:items-start" : "md:items-center",
      )}
    >
      {hasBack ? (
        <div
          className={cn(
            "self-center [grid-area:leading]",
            description && "md:mt-1 md:self-start",
          )}
        >
          <PageBackButton
            href={resolved?.href}
            fallbackHref={resolved?.fallbackHref ?? "/dashboard"}
            useHistory={resolved?.useHistory ?? false}
          />
        </div>
      ) : null}
      {hasBack ? (
        <Separator
          orientation="vertical"
          className={cn(
            "h-8 shrink-0 self-center px-px [grid-area:leading-sep]",
            description && "md:mt-1 md:self-start",
          )}
        />
      ) : null}

      <TitleBlock
        title={title}
        titleAccessory={titleAccessory}
        description={description}
        className="[grid-area:title]"
      />

      <Separator className="[grid-area:div] md:hidden" />

      <div
        className={cn(
          "min-w-0 [grid-area:meta]",
          description ? "md:mt-1 md:self-start" : "md:self-center",
        )}
      >
        {metadata}
      </div>

      <Separator
        orientation="vertical"
        className={cn(
          "hidden h-8 shrink-0 px-px [grid-area:meta-sep] md:block",
          description ? "md:mt-1 md:self-start" : "md:self-center",
        )}
      />

      {action ? (
        <div
          className={cn(
            "shrink-0 self-center [grid-area:action]",
            description && "md:mt-1 md:self-start",
          )}
        >
          {action}
        </div>
      ) : null}
    </div>
  );
}

export function PageHeader({
  title,
  titleAccessory,
  description,
  action,
  metadata,
  back = "auto",
}: {
  title: string;
  titleAccessory?: ReactNode;
  description?: string;
  action?: ReactNode;
  metadata?: ReactNode;
  back?: PageHeaderBackProp;
}) {
  const pathname = usePathname() ?? "";
  const resolved = resolveBack(back, pathname);

  if (metadata) {
    return (
      <PageHeaderWithMetadata
        resolved={resolved}
        title={title}
        titleAccessory={titleAccessory}
        description={description}
        metadata={metadata}
        action={action}
      />
    );
  }

  return (
    <PageHeaderSimple
      resolved={resolved}
      title={title}
      titleAccessory={titleAccessory}
      description={description}
      action={action}
    />
  );
}

/** @deprecated Use `PageHeader` — kept for existing imports. */
export const PageTitleRow = PageHeader;
