import { Button } from "@loftlancer/ui/button";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageStack } from "@/components/layout/app-layout";
import {
  PageHeader,
  type PageHeaderBackProp,
} from "@/components/layout/page-header";
import { layoutDashboardPageStackClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

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
  /** Rendered directly under the page header (e.g. slug / updated row). */
  metadata?: ReactNode;
  /** Rendered under metadata (e.g. stat cards). */
  stats?: ReactNode;
  /** `auto` is route-aware (no back on dashboard list routes); `false` hides; string sets parent href */
  back?: PageHeaderBackProp;
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
  metadata,
  stats,
  back = "auto",
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
    <PageStack className={cn(layoutDashboardPageStackClass)}>
      {title ? (
        <PageHeader
          title={title}
          titleAccessory={titleAccessory}
          description={description}
          action={trailingAction}
          metadata={metadata}
          back={back}
        />
      ) : null}
      {stats ? <div className="min-w-0">{stats}</div> : null}
      {children ? <div className="min-w-0">{children}</div> : null}
    </PageStack>
  );
}
