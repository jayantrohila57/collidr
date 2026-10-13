"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DESCRIPTION_MAX_WIDTH = "max-w-[65ch]";

function measureSingleLineTruncated(el: HTMLElement) {
  return el.scrollWidth > el.clientWidth + 1;
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
      setIsTruncated(measureSingleLineTruncated(el));
    };

    measure();
    const raf = requestAnimationFrame(() => {
      measure();
      requestAnimationFrame(measure);
    });

    const observer = new ResizeObserver(measure);
    observer.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [expanded, text]);

  const rootClass = cn(
    "min-w-0 text-muted-foreground text-xs leading-4",
    DESCRIPTION_MAX_WIDTH,
    className,
  );

  if (expanded) {
    return (
      <div
        className={rootClass}
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
      className={rootClass}
      data-slot="page-header-description"
      data-expanded="false"
    >
      <div className="flex min-w-0 max-w-full items-baseline">
        <span ref={measureRef} className="min-w-0 flex-1 truncate">
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
      </div>
    </div>
  );
}
