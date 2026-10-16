"use client";

import { SegmentError } from "@/components/patterns/segment-error";

export default function NewProjectSegmentError({
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
      title="Could not open new project"
      fallbackDescription="The create project form failed to load."
    />
  );
}
