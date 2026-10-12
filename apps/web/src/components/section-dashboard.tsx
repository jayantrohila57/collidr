import type { ReactNode } from "react";
import { PageHeader } from "@/components/patterns/page-header";
import { Card, CardContent } from "@/components/ui/card";

interface SectionProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  actionLabel?: string;
  actionUrl?: string;
  children: React.ReactNode;
}

export default function DashboardSection({
  title,
  description,
  action,
  actionLabel,
  actionUrl,
  children,
}: SectionProps) {
  return (
    <Card className="relative z-10 flex h-full min-h-0 w-full flex-col gap-2 rounded-none border-none bg-transparent p-2 group-has-data-[collapsible=icon]/sidebar-wrapper:gap-2 group-has-data-[collapsible=icon]/sidebar-wrapper:px-0">
      {title && (
        <PageHeader
          title={title}
          description={description}
          action={action}
          actionLabel={actionLabel}
          actionHref={actionUrl}
        />
      )}
      <div className="min-h-0 flex-1 overflow-y-auto rounded-md border bg-background">
        <CardContent className="p-2">{children}</CardContent>
      </div>
    </Card>
  );
}
