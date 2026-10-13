import type { ReactNode } from "react";
import {
  layoutChromeClass,
  layoutChromeRowClass,
  layoutContentClass,
  layoutSectionStackClass,
  layoutToolbarClass,
} from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

export type { PageHeaderBackProp } from "@/components/layout/page-header";
export { PageHeader, PageTitleRow } from "@/components/layout/page-header";

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

/** App chrome above the dashboard scroll region (not overlapping scroll content) */
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
        "relative z-50 shrink-0 border-b bg-background",
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
