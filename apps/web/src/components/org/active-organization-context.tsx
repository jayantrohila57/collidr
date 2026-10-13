"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { authClient } from "@/lib/auth-client";
import { invalidateAfterOrganizationChange } from "@/lib/invalidate-org-queries";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";

export type OrgListItem = {
  id: string;
  name: string;
  slug: string;
  metadata?: string | Record<string, unknown> | null;
};

type ActiveOrganizationContextValue = {
  enabled: boolean;
  orgs: OrgListItem[];
  activeOrganizationId: string | null;
  loading: boolean;
  isSwitching: boolean;
  initialLoadDone: boolean;
  refreshOrganizations: () => Promise<void>;
  setActiveOrganization: (organizationId: string) => Promise<void>;
  afterOrganizationCreated: (organizationId: string) => Promise<void>;
};

const ActiveOrganizationContext =
  createContext<ActiveOrganizationContextValue | null>(null);

function readSessionActiveOrganizationId(
  session: ReturnType<typeof useSession>["data"],
): string | null {
  return (
    (session?.session as { activeOrganizationId?: string | null })
      ?.activeOrganizationId ?? null
  );
}

export function ActiveOrganizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const enabled = isOrganizationsEnabledOnClient();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const sessionActiveOrganizationId = readSessionActiveOrganizationId(session);

  const [orgs, setOrgs] = useState<OrgListItem[]>([]);
  const [activeOrganizationId, setActiveOrganizationId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(enabled);
  const [isSwitching, setIsSwitching] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(!enabled);
  const initialLoadStarted = useRef(false);

  useEffect(() => {
    if (!enabled || sessionPending) {
      return;
    }
    if (sessionActiveOrganizationId) {
      setActiveOrganizationId(sessionActiveOrganizationId);
    }
  }, [enabled, sessionActiveOrganizationId, sessionPending]);

  const refreshOrganizations = useCallback(async () => {
    if (!enabled) return;
    const list = await authClient.organization.list();
    const data = (list.data ?? []) as OrgListItem[];
    setOrgs(data);
    const active = sessionActiveOrganizationId ?? data[0]?.id ?? null;
    setActiveOrganizationId(active);
  }, [enabled, sessionActiveOrganizationId]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    if (sessionPending) {
      return;
    }

    if (initialLoadStarted.current) return;
    initialLoadStarted.current = true;

    let cancelled = false;
    void (async () => {
      try {
        await refreshOrganizations();
      } catch {
        if (!cancelled) toast.error("Could not load organizations");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialLoadDone(true);
          void queryClient.prefetchQuery(trpc.projects.list.queryOptions());
          void queryClient.prefetchQuery(
            trpc.dashboard.getOverview.queryOptions(),
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, queryClient, refreshOrganizations, sessionPending]);

  const applyActiveOrganization = useCallback(
    async (organizationId: string, options?: { awaitRefresh?: boolean }) => {
      setActiveOrganizationId(organizationId);
      setIsSwitching(true);
      try {
        await authClient.organization.setActive({ organizationId });

        await invalidateAfterOrganizationChange(queryClient);
        void router.refresh();

        const refreshOrgs = refreshOrganizations();
        await Promise.all([
          queryClient.fetchQuery(trpc.projects.list.queryOptions()),
          queryClient.fetchQuery(trpc.dashboard.getOverview.queryOptions()),
        ]);

        if (options?.awaitRefresh) {
          await refreshOrgs;
        } else {
          void refreshOrgs;
        }
      } finally {
        setIsSwitching(false);
      }
    },
    [queryClient, refreshOrganizations, router],
  );

  const setActiveOrganization = useCallback(
    async (organizationId: string) => {
      if (!enabled) return;
      await applyActiveOrganization(organizationId);
    },
    [applyActiveOrganization, enabled],
  );

  const afterOrganizationCreated = useCallback(
    async (organizationId: string) => {
      if (!enabled) return;
      await applyActiveOrganization(organizationId, { awaitRefresh: true });
    },
    [applyActiveOrganization, enabled],
  );

  const value = useMemo<ActiveOrganizationContextValue>(
    () => ({
      enabled,
      orgs,
      activeOrganizationId,
      loading,
      isSwitching,
      initialLoadDone,
      refreshOrganizations,
      setActiveOrganization,
      afterOrganizationCreated,
    }),
    [
      enabled,
      orgs,
      activeOrganizationId,
      loading,
      isSwitching,
      initialLoadDone,
      refreshOrganizations,
      setActiveOrganization,
      afterOrganizationCreated,
    ],
  );

  return (
    <ActiveOrganizationContext.Provider value={value}>
      {children}
    </ActiveOrganizationContext.Provider>
  );
}

export function useActiveOrganization() {
  const ctx = useContext(ActiveOrganizationContext);
  if (!ctx) {
    throw new Error(
      "useActiveOrganization must be used within ActiveOrganizationProvider",
    );
  }
  return ctx;
}

export function useOrgQueryScopeKey(): string {
  const { enabled, activeOrganizationId } = useActiveOrganization();
  if (!enabled) return "orgs-off";
  return activeOrganizationId ?? "no-active-org";
}
