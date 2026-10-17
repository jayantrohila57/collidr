import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@loftlancer/ui/empty";
import { Frame, FramePanel } from "@loftlancer/ui/frame";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { layoutContentClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

export function PageStatusShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[50vh] flex-1 flex-col items-center justify-center",
        layoutContentClass,
        className,
      )}
    >
      <Frame className="w-full max-w-lg">{children}</Frame>
    </div>
  );
}

export function PageStatusEmpty({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <PageStatusShell>
      <FramePanel>
        <Empty className="border-0">
          <EmptyHeader>
            {Icon ? (
              <EmptyMedia variant="icon">
                <Icon className="size-5" aria-hidden />
              </EmptyMedia>
            ) : null}
            <EmptyTitle>{title}</EmptyTitle>
            {description ? (
              <EmptyDescription>{description}</EmptyDescription>
            ) : null}
          </EmptyHeader>
          {action ? <EmptyContent>{action}</EmptyContent> : null}
        </Empty>
      </FramePanel>
    </PageStatusShell>
  );
}
