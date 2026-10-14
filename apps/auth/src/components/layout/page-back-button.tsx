"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppIcon } from "@/components/patterns/app-icon";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Route } from "next";
import type { PageBackHref } from "@/lib/page-back";

const SETTINGS_FALLBACK = "/settings" as Route;
import { cn } from "@/lib/utils";

const backButtonClassName = "size-8 shrink-0";

export function PageBackButton({
  href,
  fallbackHref = SETTINGS_FALLBACK,
  useHistory = false,
  className,
}: {
  href?: PageBackHref | null;
  fallbackHref?: PageBackHref;
  useHistory?: boolean;
  className?: string;
}) {
  const router = useRouter();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  };

  if (!useHistory && href) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(backButtonClassName, className)}
              aria-label="Back"
              render={<Link href={href} />}
            />
          }
        >
          <AppIcon name="back" className="text-foreground" />
        </TooltipTrigger>
        <TooltipContent>Back</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(backButtonClassName, className)}
            aria-label="Back"
            onClick={goBack}
          />
        }
      >
        <AppIcon name="back" className="text-foreground" />
      </TooltipTrigger>
      <TooltipContent>Back</TooltipContent>
    </Tooltip>
  );
}
