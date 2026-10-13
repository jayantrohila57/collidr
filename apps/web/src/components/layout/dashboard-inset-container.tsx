import type { ReactNode } from "react";
import type { DashboardContentWidth } from "@/lib/dashboard-content-width";
import {
  layoutInsetContainerNarrowClass,
  layoutInsetContainerWideClass,
} from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

export function dashboardInsetContainerClass(width: DashboardContentWidth) {
  return width === "narrow"
    ? layoutInsetContainerNarrowClass
    : layoutInsetContainerWideClass;
}

export function DashboardInsetContainer({
  width,
  className,
  children,
}: {
  width: DashboardContentWidth;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(dashboardInsetContainerClass(width), className)}>
      {children}
    </div>
  );
}
