"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { cn, touchTarget } from "@/lib/utils";

interface HorizontalScrollRailProps {
  children: ReactNode;
  className?: string;
}

export function HorizontalScrollRail({
  children,
  className,
}: HorizontalScrollRailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + 4;
    setHasOverflow(overflow);
    if (!overflow) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateScrollState]);

  const scrollBy = (delta: number) => {
    ref.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div
      className={cn(
        "flex min-w-0 items-center",
        hasOverflow && "gap-0.5",
        className,
      )}
    >
      {hasOverflow && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            "size-11 shrink-0",
            touchTarget,
            !canScrollLeft && "pointer-events-none opacity-0",
          )}
          aria-label="Scroll tabs left"
          aria-hidden={!canScrollLeft}
          tabIndex={canScrollLeft ? 0 : -1}
          onClick={() => scrollBy(-180)}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Button>
      )}
      <div className="relative min-w-0 flex-1">
        {hasOverflow && canScrollLeft && (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-background to-transparent"
            aria-hidden
          />
        )}
        {hasOverflow && canScrollRight && (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-background to-transparent"
            aria-hidden
          />
        )}
        <div
          ref={ref}
          onScroll={updateScrollState}
          className="min-w-0 overflow-x-auto overscroll-x-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:thin]"
        >
          {children}
        </div>
      </div>
      {hasOverflow && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            "size-11 shrink-0",
            touchTarget,
            !canScrollRight && "pointer-events-none opacity-0",
          )}
          aria-label="Scroll tabs right"
          aria-hidden={!canScrollRight}
          tabIndex={canScrollRight ? 0 : -1}
          onClick={() => scrollBy(180)}
        >
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      )}
    </div>
  );
}
