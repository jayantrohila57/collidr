"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TruncatedTextProps {
  text: string;
  className?: string;
  lines?: number;
  emptyFallback?: string;
}

export function TruncatedText({
  text,
  className,
  lines = 2,
  emptyFallback = "No description provided.",
}: TruncatedTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  const content = text.trim() || emptyFallback;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || expanded) {
      setIsTruncated(false);
      return;
    }

    const measure = () => {
      setIsTruncated(el.scrollHeight > el.clientHeight + 1);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded]);

  if (expanded) {
    return (
      <div className={cn("space-y-2", className)}>
        <p className="wrap-anywhere text-muted-foreground text-sm leading-relaxed">
          {content}
        </p>
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-xs"
          onClick={() => setExpanded(false)}
        >
          Show less
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <p
            ref={ref}
            className={cn(
              "wrap-anywhere text-muted-foreground text-sm leading-relaxed",
              lines === 2 && "line-clamp-2",
              lines === 3 && "line-clamp-3",
            )}
          >
            {content}
          </p>
        </TooltipTrigger>
        {isTruncated && (
          <TooltipContent
            side="bottom"
            className="wrap-anywhere max-w-md text-left"
          >
            {content}
          </TooltipContent>
        )}
      </Tooltip>
      {isTruncated && (
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-xs"
          onClick={() => setExpanded(true)}
        >
          Show more
        </Button>
      )}
    </div>
  );
}
