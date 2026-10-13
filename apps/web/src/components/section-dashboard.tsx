import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import GoBackButton from "@/components/go-back";
import { Button } from "@/components/ui/button";

interface SectionProps {
  title?: string;
  description?: string;
  titleAccessory?: ReactNode;
  action?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  /** @deprecated use actionLabel */
  actionUrl?: string;
  children: React.ReactNode;
  showBack?: boolean;
}

export default function DashboardSection({
  title,
  description,
  titleAccessory,
  action,
  actionLabel,
  actionHref,
  actionUrl,
  children,
  showBack = true,
}: SectionProps) {
  const resolvedActionHref = actionHref ?? actionUrl;
  const trailingAction =
    action ??
    (actionLabel && resolvedActionHref ? (
      <Button
        variant="default"
        size="sm"
        render={<Link href={resolvedActionHref as Route} />}
      >
        {actionLabel}
      </Button>
    ) : null);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {showBack ? <GoBackButton /> : null}
      {title ? (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-semibold text-lg tracking-tight">{title}</h1>
              {titleAccessory}
            </div>
            {description ? (
              <p className="text-muted-foreground text-sm">{description}</p>
            ) : null}
          </div>
          {trailingAction ? (
            <div className="shrink-0">{trailingAction}</div>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
