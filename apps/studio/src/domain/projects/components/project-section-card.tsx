"use client";

import { Card, CardPanel } from "@loftlancer/ui/card";
import type { Route } from "next";
import Link from "next/link";
import { AppIcon } from "@/components/patterns/app-icon";
import type { AppIconName } from "@/lib/icons";
import { cn } from "@/lib/utils";

type ProjectSectionCardProps = {
  href: Route;
  icon: AppIconName;
  title: string;
  description: string;
  summary: string;
  onPrefetch?: () => void;
};

export function ProjectSectionCard({
  href,
  icon,
  title,
  description,
  summary,
  onPrefetch,
}: ProjectSectionCardProps) {
  return (
    <Card
      className={cn(
        "group transition-colors hover:border-primary/30 hover:bg-muted/30",
        "focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
      )}
      render={
        <Link
          href={href}
          className="flex h-full min-w-0 flex-col outline-none"
          onMouseEnter={onPrefetch}
          onFocus={onPrefetch}
        />
      }
    >
      <CardPanel className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50"
            aria-hidden
          >
            <AppIcon name={icon} className="size-4 text-muted-foreground" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <h2 className="font-medium text-sm leading-snug">{title}</h2>
              <AppIcon
                name="chevronRight"
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
            </div>
            <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
              {description}
            </p>
          </div>
        </div>
        <p className="text-muted-foreground text-xs tabular-nums">{summary}</p>
      </CardPanel>
    </Card>
  );
}
