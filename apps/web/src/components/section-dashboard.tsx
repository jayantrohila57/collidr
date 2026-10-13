import type { ReactNode } from "react";
import { PageShell } from "@/components/layout/page-shell";

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
    <PageShell
      title={title}
      description={description}
      titleAccessory={titleAccessory}
      action={action}
      actionLabel={actionLabel}
      actionHref={resolvedActionHref}
      showBack={showBack}
    >
      {children}
    </PageShell>
  );
}
