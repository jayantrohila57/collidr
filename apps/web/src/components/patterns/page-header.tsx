import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import GoBackButton from "@/components/go-back";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  showBack?: boolean;
}

export function PageHeader({
  title,
  description,
  action,
  actionLabel,
  actionHref,
  showBack = true,
}: PageHeaderProps) {
  return (
    <header className="flex shrink-0 flex-row items-start gap-2">
      {showBack && <GoBackButton />}
      <div className="min-h-[3.25rem] min-w-0 flex-1">
        <h1 className="truncate font-semibold text-xl tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="line-clamp-2 break-words text-muted-foreground text-xs">
            {description}
          </p>
        )}
      </div>
      {action ??
        (actionLabel && actionHref ? (
          <Button variant="default" asChild className="shrink-0">
            <Link href={actionHref as Route}>{actionLabel}</Link>
          </Button>
        ) : null)}
    </header>
  );
}
