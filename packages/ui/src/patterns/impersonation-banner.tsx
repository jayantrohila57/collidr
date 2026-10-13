"use client";

import type { ReactNode } from "react";
import {
  layoutGapClass,
  layoutGutterClass,
  layoutRowClass,
} from "../lib/layout-spacing";
import { cn } from "../lib/utils";

export type ImpersonationBannerProps = {
  /** When set, the banner is shown (admin impersonation session). */
  impersonatedByUserId?: string | null;
  /** Optional label for the impersonated subject. */
  subjectLabel?: ReactNode;
  /** Wired to Better Auth admin `stopImpersonating` on each app (P7). */
  onStopImpersonating?: () => void;
  className?: string;
};

/**
 * Persistent impersonation chrome (Decision 19). Stub for P1 — render when
 * `impersonatedByUserId` is present; exit action is optional until console ships.
 */
export function ImpersonationBanner({
  impersonatedByUserId,
  subjectLabel,
  onStopImpersonating,
  className,
}: ImpersonationBannerProps) {
  if (!impersonatedByUserId) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-full shrink-0 items-center justify-between border-amber-500/40 border-b bg-amber-500/10 text-amber-950 dark:text-amber-50",
        layoutGutterClass,
        layoutGapClass,
        layoutRowClass,
        className,
      )}
    >
      <p className="min-w-0 font-medium text-sm">
        Impersonation active
        {subjectLabel ? (
          <>
            {" "}
            <span className="font-normal text-amber-900/80 dark:text-amber-100/80">
              ({subjectLabel})
            </span>
          </>
        ) : null}
      </p>
      {onStopImpersonating ? (
        <button
          type="button"
          className={cn(
            "shrink-0 rounded-md px-2 py-1 font-medium text-sm underline-offset-4 hover:underline",
          )}
          onClick={onStopImpersonating}
        >
          Exit impersonation
        </button>
      ) : null}
    </div>
  );
}
