import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageSection } from "@/components/layout/page-section";
import { PageHeader } from "@/components/patterns/page-header";

interface PageShellProps {
  title?: string;
  description?: string;
  titleAccessory?: ReactNode;
  action?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  showBack?: boolean;
  children: ReactNode;
  containerSize?: "default" | "narrow" | "full";
}

/** Dashboard page frame: header + bordered content (sidebar-07 / dashboard-01). */
export function PageShell({
  title,
  description,
  titleAccessory,
  action,
  actionLabel,
  actionHref,
  showBack = true,
  children,
  containerSize = "default",
}: PageShellProps) {
  return (
    <PageContainer size={containerSize}>
      {title ? (
        <PageHeader
          title={title}
          description={description}
          titleAccessory={titleAccessory}
          action={action}
          actionLabel={actionLabel}
          actionHref={actionHref}
          showBack={showBack}
        />
      ) : null}
      <PageSection>{children}</PageSection>
    </PageContainer>
  );
}
