"use client";

import { Monitor, MonitorSmartphone, Smartphone, Tablet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime } from "@/lib/format";
import { formatRelativeShort } from "@/lib/format-relative-short";
import {
  parseSessionDevice,
  type SessionDeviceKind,
  sessionDeviceLabel,
} from "@/lib/session-device";

export type AuthSessionRow = {
  id?: string;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  updatedAt?: Date | string;
  createdAt?: Date | string;
};

const DEVICE_ICONS: Record<SessionDeviceKind, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  unknown: MonitorSmartphone,
};

const ROW_CLASS = "flex min-h-14 items-center gap-3 px-4 py-2.5";

/** Skeleton mirroring {@link SessionsList} rows (zero layout shift). */
export function SessionsListSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-border/60" aria-busy>
      {Array.from({ length: rows }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
        <li key={i} className={ROW_CLASS}>
          <Skeleton className="size-8 shrink-0 rounded-lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-20 shrink-0" />
        </li>
      ))}
    </ul>
  );
}

/** Session rows after reui settings-10: device, IP, last active, Current badge. */
export function SessionsList({
  sessions,
  currentToken,
  pendingToken,
  disabled,
  onRevoke,
}: {
  sessions: AuthSessionRow[];
  currentToken?: string;
  pendingToken?: string | null;
  disabled?: boolean;
  onRevoke: (token: string) => void;
}) {
  const ordered = [...sessions].sort((a, b) => {
    if (a.token === currentToken) return -1;
    if (b.token === currentToken) return 1;
    return (
      new Date(String(b.updatedAt ?? b.createdAt ?? 0)).getTime() -
      new Date(String(a.updatedAt ?? a.createdAt ?? 0)).getTime()
    );
  });
  return (
    <ul className="divide-y divide-border/60">
      {ordered.map((row) => {
        const isCurrent = row.token === currentToken;
        const lastActive = row.updatedAt ?? row.createdAt;
        const Icon = DEVICE_ICONS[parseSessionDevice(row.userAgent).kind];
        const pending = pendingToken === row.token;
        return (
          <li key={row.token} className={ROW_CLASS}>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted ring-1 ring-border/60">
              <Icon className="size-4 text-muted-foreground" aria-hidden />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex min-w-0 items-center gap-1.5">
                <p className="truncate font-medium text-sm">
                  {sessionDeviceLabel(row.userAgent)}
                </p>
                {isCurrent ? (
                  <Badge variant="secondary" className="shrink-0">
                    Current
                  </Badge>
                ) : null}
              </div>
              <p className="flex min-w-0 flex-wrap gap-x-3 gap-y-0.5 text-muted-foreground text-xs">
                <span className="tabular-nums">
                  {row.ipAddress ? row.ipAddress : "IP unknown"}
                </span>
                {lastActive ? (
                  <span title={formatDateTime(String(lastActive))}>
                    {isCurrent
                      ? "Active now"
                      : `Last active ${formatRelativeShort(String(lastActive))}`}
                  </span>
                ) : null}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-20 shrink-0"
              disabled={disabled || pending}
              onClick={() => onRevoke(row.token)}
            >
              {pending ? <Spinner className="size-3.5" /> : null}
              {isCurrent ? "Sign out" : "Revoke"}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
