import type { ReactNode } from "react";
import {
  layoutChromeClass,
  layoutChromeRowClass,
} from "../lib/layout-spacing";
import { cn } from "../lib/utils";

/** Sticky dashboard header bar (below sidebar inset). */
export function DashboardPageHeaderBar({
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

export function DashboardPageHeaderRow({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn(layoutChromeRowClass, className)}>{children}</div>;
}
