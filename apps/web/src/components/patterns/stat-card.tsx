import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppIconName } from "@/lib/icons";
import { layoutGapClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

export type StatCardItem = {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: AppIconName;
  href?: Route;
};

function StatCardInner({ item }: { item: StatCardItem }) {
  return (
    <Card className="h-full">
      <CardHeader className="gap-1 p-3 pb-1 sm:p-4 sm:pb-1">
        <div className="flex items-start justify-between gap-2">
          <CardDescription className="text-xs">{item.label}</CardDescription>
          <AppIcon name={item.icon} className="size-4" />
        </div>
        <CardTitle className="truncate text-nowrap text-xl tabular-nums sm:text-2xl">
          {item.value}
        </CardTitle>
      </CardHeader>
      {item.hint ? (
        <CardPanel className="truncate text-nowrap px-3 pt-0 pb-3 text-muted-foreground text-xs sm:px-4 sm:pb-4">
          {item.hint}
        </CardPanel>
      ) : null}
    </Card>
  );
}

export function StatCard({
  item,
  className,
}: {
  item: StatCardItem;
  className?: string;
}) {
  const card = (
    <div className={cn("min-w-0", className)}>
      <StatCardInner item={item} />
    </div>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="block min-w-0 transition-opacity hover:opacity-90"
      >
        <Card className="h-full transition-colors hover:bg-muted/40">
          <CardHeader className="gap-1 p-3 pb-1 sm:p-4 sm:pb-1">
            <div className="flex items-start justify-between gap-2">
              <CardDescription className="text-xs">
                {item.label}
              </CardDescription>
              <AppIcon name={item.icon} className="size-4" />
            </div>
            <CardTitle className="truncate text-nowrap text-xl tabular-nums sm:text-2xl">
              {item.value}
            </CardTitle>
          </CardHeader>
          {item.hint ? (
            <CardPanel className="truncate text-nowrap px-3 pt-0 pb-3 text-muted-foreground text-xs sm:px-4 sm:pb-4">
              {item.hint}
            </CardPanel>
          ) : null}
        </Card>
      </Link>
    );
  }

  return card;
}

export function StatCardRow({
  items,
  className,
}: {
  items: StatCardItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 lg:grid-cols-4",
        layoutGapClass,
        className,
      )}
    >
      {items.map((item) => (
        <StatCard key={item.label} item={item} />
      ))}
    </div>
  );
}

const STAT_SKELETON_SLOTS = ["a", "b", "c", "d"] as const;

export function StatCardRowSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 lg:grid-cols-4",
        layoutGapClass,
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {STAT_SKELETON_SLOTS.slice(0, count).map((slot) => (
        <Card key={slot} className="h-full">
          <CardHeader className="gap-2 p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="size-4 rounded-sm" />
            </div>
            <Skeleton className="h-7 w-12" />
          </CardHeader>
          <CardPanel className="px-3 pt-0 pb-3 sm:px-4 sm:pb-4">
            <Skeleton className="h-3 w-24" />
          </CardPanel>
        </Card>
      ))}
    </div>
  );
}
