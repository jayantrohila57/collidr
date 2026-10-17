"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const DESCRIPTION_MAX_WIDTH = "max-w-[65ch]";
const DESCRIPTION_LINES = 2;

const expandToggleClassName =
  "inline cursor-pointer border-0 bg-transparent p-0 font-normal text-muted-foreground text-xs underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background";

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
  const measureRef = useRef<HTMLParagraphElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `text` is a deliberate trigger; a new description must be re-measured even when the element size stays the same.
  useLayoutEffect(() => {
    if (expanded) {
      return;
    }
    const el = measureRef.current;
    if (!el) return;

    const measure = () => {
      setIsTruncated(measureLineClampTruncated(el, DESCRIPTION_LINES));
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
          {text}{" "}
          <button
            type="button"
            className={expandToggleClassName}
            onClick={() => setExpanded(false)}
          >
            less
          </button>
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
      <div className="relative min-w-0">
        <p
          ref={measureRef}
          className={cn(
            "wrap-anywhere line-clamp-2 min-w-0 [overflow-wrap:anywhere]",
            isTruncated && "pe-[2.75rem]",
          )}
        >
          {text}
        </p>
        {isTruncated ? (
          <button
            type="button"
            className={cn(
              expandToggleClassName,
              "absolute right-0 bottom-0 bg-background ps-0.5 leading-4",
            )}
            onClick={() => setExpanded(true)}
          >
            more
          </button>
        ) : null}
      </div>
    </div>
  );
}
