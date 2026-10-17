"use client";

import { useIsMobile } from "@loftlancer/ui/hooks/use-media-query";
import { HorizontalScrollRail } from "@loftlancer/ui/patterns/horizontal-scroll-rail";
import {
  Tabs,
  TabsList,
  TabsPanel,
  type TabsPrimitive,
  TabsTab,
} from "@loftlancer/ui/tabs";
import type { ReactNode } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import type { AppIconName } from "@/lib/icons";
import { iconMutedClassName } from "@/lib/icons";
import { cn } from "@/lib/utils";

export type SettingsTabBar = "sidebar" | "line";

export function SettingsTabs({
  className,
  tabBar = "sidebar",
  ...props
}: TabsPrimitive.Root.Props & {
  tabBar?: SettingsTabBar;
}): React.ReactElement {
  const isMobile = useIsMobile();
  const horizontal = tabBar === "line" || isMobile;
  return (
    <Tabs
      orientation={horizontal ? "horizontal" : "vertical"}
      className={cn(
        "min-w-0 gap-2",
        horizontal && tabBar === "line" && "gap-4",
        className,
      )}
      {...props}
    />
  );
}

export function SettingsTabsList({
  className,
  children,
  tabBar = "sidebar",
}: {
  className?: string;
  children: ReactNode;
  tabBar?: SettingsTabBar;
}): React.ReactElement {
  const isMobile = useIsMobile();
  const horizontal = tabBar === "line" || isMobile;

  const list = (
    <TabsList
      variant="underline"
      size="sm"
      className={cn(
        horizontal
          ? "h-9 min-h-9 w-fit shrink-0 justify-start gap-0 bg-transparent p-0"
          : "h-auto w-full min-w-[10.5rem] max-w-[12.5rem] shrink-0 items-stretch justify-start gap-0 bg-transparent p-0",
        className,
      )}
    >
      {children}
    </TabsList>
  );

  if (horizontal) {
    return (
      <HorizontalScrollRail compactControls className="min-w-0">
        <div className="flex w-max min-w-full items-end gap-1 border-border border-b">
          {list}
        </div>
      </HorizontalScrollRail>
    );
  }

  return list;
}

export function SettingsTabsTab({
  value,
  icon,
  children,
  className,
  tabBar = "sidebar",
}: {
  value: string;
  icon: AppIconName;
  children: ReactNode;
  className?: string;
  tabBar?: SettingsTabBar;
}): React.ReactElement {
  const isMobile = useIsMobile();
  const horizontal = tabBar === "line" || isMobile;

  return (
    <TabsTab
      value={value}
      size="sm"
      className={cn(
        "gap-2",
        horizontal
          ? "h-9 min-h-9 shrink-0 grow-0 whitespace-nowrap rounded-none px-2.5 data-active:shadow-none"
          : "w-full grow-0 justify-start rounded-md px-2.5",
        className,
      )}
    >
      <AppIcon name={icon} className={iconMutedClassName} />
      <span>{children}</span>
    </TabsTab>
  );
}

export { TabsPanel as SettingsTabsPanel };
