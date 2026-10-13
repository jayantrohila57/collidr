import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import GoBackButton from "@/components/go-back";
import { PageStack, PageTitleRow } from "@/components/layout/app-layout";
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
  showBack = false,
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
    <PageStack>
      {showBack ? <GoBackButton /> : null}
      {title ? (
        <PageTitleRow
          title={title}
          titleAccessory={titleAccessory}
          description={description}
          action={trailingAction}
        />
      ) : null}
      {children}
    </PageStack>
  );
}
