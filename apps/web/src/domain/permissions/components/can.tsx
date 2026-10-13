"use client";

import type { ActionName } from "@env-manager/actions";
import { useCan } from "../hooks/use-permissions";

type CanProps = {
  action: ActionName;
  projectId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export function Can({
  action,
  projectId,
  fallback = null,
  children,
}: CanProps) {
  const { allowed, isLoading } = useCan(action, { projectId });
  if (isLoading) return null;
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
