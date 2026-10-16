"use client";

import { SegmentError } from "@/components/patterns/segment-error";

export default function OnboardingSegmentError({
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
      title="Onboarding failed to load"
      fallbackDescription="We could not load organization onboarding."
    />
  );
}
