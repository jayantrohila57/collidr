"use client";

import { SegmentError } from "@/components/patterns/segment-error";

export default function OrganizationsSegmentError({
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
      title="Organizations failed to load"
      fallbackDescription="We could not load your organizations list."
    />
  );
}
