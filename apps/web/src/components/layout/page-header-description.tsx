"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function measureLineClampTruncated(el: HTMLElement, lines: number) {
  const style = getComputedStyle(el);
  const lineHeight = Number.parseFloat(style.lineHeight);
  if (Number.isFinite(lineHeight) && lineHeight > 0 && lines > 0) {
    return el.scrollHeight > lineHeight * lines + 1;
  }
  return el.scrollHeight > el.clientHeight + 1;
}

export function PageHeaderDescription({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const measureRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (expanded) {
      return;
    }
    const el = measureRef.current;
    if (!el) return;

    const measure = () => {
      setIsTruncated(measureLineClampTruncated(el, 1));
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
  }, [expanded, text]);

  const lineClass = "min-h-4 text-xs leading-4";

  if (expanded) {
    return (
      <div
        className={cn("min-w-0 text-muted-foreground", lineClass, className)}
        data-slot="page-header-description"
        data-expanded="true"
      >
        <p className="wrap-anywhere">
          {text}
          <Button
            type="button"
            variant="link"
            className="inline h-auto p-0 ps-1 align-baseline text-xs"
            onClick={() => setExpanded(false)}
          >
            less
          </Button>
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("min-w-0 text-muted-foreground", lineClass, className)}
      data-slot="page-header-description"
      data-expanded="false"
    >
      <p className="flex min-w-0 items-baseline gap-0">
        <span ref={measureRef} className="line-clamp-1 min-w-0">
          {text}
        </span>
        {isTruncated ? (
          <Button
            type="button"
            variant="link"
            className="inline h-auto shrink-0 p-0 ps-0.5 align-baseline text-xs"
            onClick={() => setExpanded(true)}
          >
            … more
          </Button>
        ) : null}
      </p>
    </div>
  );
}
