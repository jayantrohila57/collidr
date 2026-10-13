import type { ReactNode } from "react";
import {
  layoutChromeClass,
  layoutChromeRowClass,
  layoutContentClass,
  layoutPageTitleClass,
  layoutSectionStackClass,
  layoutToolbarClass,
} from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

export function PageMain({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn(layoutContentClass, className)}>{children}</div>;
}

export function PageStack({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(layoutSectionStackClass, className)}>{children}</div>
  );
}

/** Sticky app chrome — same padding/row height as SidebarHeader + team switcher */
export function PageHeaderBar({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <header
      className={cn(
        "z-40 shrink-0 border-b bg-background",
        layoutChromeClass,
        className,
      )}
    >
      {children}
    </header>
  );
}

export function PageHeaderRow({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn(layoutChromeRowClass, className)}>{children}</div>;
}

export function PageTitleRow({
  title,
  titleAccessory,
  description,
  action,
}: {
  title: string;
  titleAccessory?: ReactNode;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className={layoutChromeRowClass}>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h1 className={cn(layoutPageTitleClass, "truncate")}>{title}</h1>
          {titleAccessory}
        </div>
        {description ? (
          <p className="text-muted-foreground text-xs">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PageToolbar({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn(layoutToolbarClass, className)}>{children}</div>;
}

export { layoutFormStackClass } from "@/lib/layout-spacing";
