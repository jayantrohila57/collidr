"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@/components/ui/preview-card";
import { cn } from "@/lib/utils";

interface TruncatedTextProps {
  text: string;
  className?: string;
  lines?: number;
  emptyFallback?: string;
}

function measureIsTruncated(el: HTMLParagraphElement, lines: number) {
  const style = getComputedStyle(el);
  const lineHeight = Number.parseFloat(style.lineHeight);
  if (Number.isFinite(lineHeight) && lineHeight > 0 && lines > 0) {
    const clampedMax = lineHeight * lines + 2;
    if (el.scrollHeight > clampedMax) {
      return true;
    }
  }
  return (
    el.scrollHeight > el.clientHeight + 1 ||
    el.scrollHeight > el.offsetHeight + 1
  );
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
      setIsTruncated(measureIsTruncated(el, lines));
    };

    measure();
    const raf = requestAnimationFrame(() => {
      measure();
      requestAnimationFrame(measure);
    });

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.parentElement) {
      observer.observe(el.parentElement);
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [expanded, content, lines]);

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

  const clamped = (
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
  );

  return (
    <div className={cn("space-y-1", className)}>
      {isTruncated ? (
        <PreviewCard>
          <PreviewCardTrigger
            render={
              <button
                type="button"
                className="w-full cursor-default text-start"
                aria-label="Show full description"
              >
                {clamped}
              </button>
            }
          />
          <PreviewCardPopup
            align="start"
            className="wrap-anywhere max-w-md text-start"
          >
            {content}
          </PreviewCardPopup>
        </PreviewCard>
      ) : (
        clamped
      )}
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
