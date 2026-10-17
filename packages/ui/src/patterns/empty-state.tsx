import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

/**
 * Shared dense empty state (reui empty-state-3 inspired).
 * Icon tile + title + description + primary/secondary actions.
 * Pass `className` with the loaded list's min-height so empty, skeleton
 * and list occupy the same region (zero layout shift).
 */
export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  /** Primary CTA (a real button/link). Overrides `actionLabel`. */
  action?: ReactNode;
  /** Shorthand primary CTA label; rendered as a small link (`actionHref`) or button (`onAction`). */
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  /** Optional secondary CTA rendered next to the primary one. */
  secondaryAction?: ReactNode;
  /** Render without the dashed frame (e.g. inside an existing card). */
  bare?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  actionHref,
  onAction,
  secondaryAction,
  bare = false,
  className,
  "data-testid": testId,
}: EmptyStateProps) {
  const primary =
    action ??
    (actionLabel && actionHref ? (
      <Button size="sm" render={<Link href={actionHref as Route} />}>
        {actionLabel}
      </Button>
    ) : actionLabel && onAction ? (
      <Button type="button" size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null);
  return (
    <div
      data-slot="empty-state"
      data-testid={testId}
      className={cn(
        "flex min-h-64 w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 p-6 text-center",
        !bare && "rounded-xl border border-border/60 border-dashed",
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-border/60">
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-balance text-muted-foreground text-xs">
          {description}
        </p>
      </div>
      {primary || secondaryAction ? (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {primary}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
