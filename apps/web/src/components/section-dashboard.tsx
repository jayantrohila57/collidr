import type { ReactNode } from "react";
import { PageHeader } from "@/components/patterns/page-header";
import { Card, CardContent } from "@/components/ui/card";

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
  return (
    <Card className="relative z-10 flex h-full min-h-0 w-full min-w-0 max-w-full flex-col gap-2 overflow-hidden rounded-none border-none bg-transparent p-2 group-has-data-[collapsible=icon]/sidebar-wrapper:gap-2 group-has-data-[collapsible=icon]/sidebar-wrapper:px-0">
      {title && (
        <PageHeader
          title={title}
          description={description}
          titleAccessory={titleAccessory}
          action={action}
          actionLabel={actionLabel}
          actionHref={resolvedActionHref}
          showBack={showBack}
        />
      )}
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden rounded-md border bg-background">
        <CardContent className="min-w-0 p-2">{children}</CardContent>
      </div>
    </Card>
  );
}
