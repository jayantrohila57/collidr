"use client";

import { SegmentError } from "@/components/patterns/segment-error";

export default function ProjectsSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SegmentError
      error={error}
      reset={reset}
      title="Projects failed to load"
      fallbackDescription="We could not load your projects list."
    />
  );
}
