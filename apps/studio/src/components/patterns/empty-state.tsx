import { Button } from "@loftlancer/ui/button";
import { EmptyState as SharedEmptyState } from "@loftlancer/ui/patterns/empty-state";
import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  /** Custom primary action (e.g. a sheet trigger); overrides actionLabel. */
  action?: ReactNode;
  secondaryAction?: ReactNode;
  bare?: boolean;
  className?: string;
  "data-testid"?: string;
}

/** Studio adapter over the shared `@loftlancer/ui` empty state (#214). */
export function EmptyState({
  actionLabel,
  actionHref,
  onAction,
  action,
  ...props
}: EmptyStateProps) {
  const primary =
    action ??
    (actionLabel && (actionHref || onAction) ? (
      actionHref ? (
        <Button size="sm" render={<Link href={actionHref as Route} />}>
          {actionLabel}
        </Button>
      ) : (
        <Button type="button" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )
    ) : null);

  return <SharedEmptyState {...props} action={primary} />;
}
