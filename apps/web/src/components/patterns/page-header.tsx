import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import GoBackButton from "@/components/go-back";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  titleAccessory?: ReactNode;
  action?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  showBack?: boolean;
}

export function PageHeader({
  title,
  description,
  titleAccessory,
  action,
  actionLabel,
  actionHref,
  showBack = true,
}: PageHeaderProps) {
  const trailingAction =
    action ??
    (actionLabel && actionHref ? (
      <Button variant="default" asChild className="shrink-0">
        <Link href={actionHref as Route}>{actionLabel}</Link>
      </Button>
    ) : null);

  return (
    <header className="flex min-w-0 shrink-0 flex-col gap-4 pb-1">
      {showBack ? (
        <div className="-ms-1">
          <GoBackButton />
        </div>
      ) : null}
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="min-w-0 truncate font-semibold text-xl tracking-tight">
              {title}
            </h1>
            {titleAccessory}
          </div>
          {description ? (
            <p className="wrap-anywhere text-muted-foreground text-sm">
              {description}
            </p>
          ) : null}
        </div>
        {trailingAction ? (
          <div className="flex shrink-0 items-center">{trailingAction}</div>
        ) : null}
      </div>
    </header>
  );
}
