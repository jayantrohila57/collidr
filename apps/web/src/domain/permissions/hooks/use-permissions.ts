"use client";

import type { ActionName } from "@env-manager/actions";
import { useQuery } from "@tanstack/react-query";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import { trpc } from "@/utils/trpc";

const POLL_MS = 30_000;

export function usePermissionsSnapshot(projectId?: string) {
  const enabled = isActionsAuditEnabledOnClient();
  return useQuery({
    ...trpc.permissions.snapshot.queryOptions(
      projectId ? { projectId } : undefined,
    ),
    enabled,
    staleTime: POLL_MS,
    refetchInterval: enabled ? POLL_MS : false,
  });
}

export function useCan(action: ActionName, options?: { projectId?: string }) {
  const { data, isLoading } = usePermissionsSnapshot(options?.projectId);
  const allowed = data?.actions?.[action] ?? !isActionsAuditEnabledOnClient();
  const reason = allowed ? undefined : "denied";
  return { allowed, reason, isLoading };
}

export function useUnassignedOrgMember() {
  const { data, isLoading } = usePermissionsSnapshot();
  return {
    unassigned: Boolean(data?.unassignedMember),
    isLoading,
  };
}
