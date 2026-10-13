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
import type { PageBackHref } from "@/lib/page-back";

export function PageBackButton({ href }: { href?: PageBackHref | null }) {
  const router = useRouter();

  if (href) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
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
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            aria-label="Back"
            onClick={() => router.back()}
          />
        }
      >
        <AppIcon name="back" className="text-foreground" />
      </TooltipTrigger>
      <TooltipContent>Back</TooltipContent>
    </Tooltip>
  );
}
