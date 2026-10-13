import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import GoBackButton from "@/components/go-back";
import { Button } from "@/components/ui/button";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";

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
        render={<Link href={resolvedActionHref as Route} />}
      >
        {actionLabel}
      </Button>
    ) : null);

  return (
    <Frame>
      {showBack ? (
        <FramePanel>
          <GoBackButton />
        </FramePanel>
      ) : null}
      {title ? (
        <FrameHeader>
          <FrameTitle>
            {title}
            {titleAccessory}
          </FrameTitle>
          {description ? (
            <FrameDescription>{description}</FrameDescription>
          ) : null}
        </FrameHeader>
      ) : null}
      <FramePanel>{children}</FramePanel>
      {trailingAction ? <FrameFooter>{trailingAction}</FrameFooter> : null}
    </Frame>
  );
}
