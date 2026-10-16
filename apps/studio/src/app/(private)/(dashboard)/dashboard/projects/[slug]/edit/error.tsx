"use client";

import { SegmentError } from "@/components/patterns/segment-error";

export default function EditProjectSegmentError({
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
      title="Edit project failed to load"
      fallbackDescription="We could not load the project editor."
    />
  );
}
