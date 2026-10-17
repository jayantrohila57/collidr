"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@loftlancer/ui/empty";
import {
  type ActivityResult,
  ActivityTimeline,
  auditRowToActivityItem,
} from "@loftlancer/ui/patterns/activity-timeline";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCurrentOrgSlug } from "@/components/org/use-current-org-slug";
import { ErrorState } from "@/components/patterns/error-state";
import {
  CONTACT_MANAGER_DESCRIPTION,
  CONTACT_MANAGER_TITLE,
} from "@/domain/permissions/contact-manager";
import { useUnassignedOrgMember } from "@/domain/permissions/hooks/use-permissions";
import { formatActionLabel } from "@/lib/format-action-label";

import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

type TimelinePageClientProps = {
  scope: "org" | "self";
};

export function TimelinePageClient({ scope }: TimelinePageClientProps) {
  const { unassigned, isLoading: unassignedLoading } = useUnassignedOrgMember();
  const org = useCurrentOrgSlug() ?? "";
  const [action, setAction] = useState("");
  const [result, setResult] = useState<ActivityResult | "">("");

  const query = useInfiniteQuery(
    trpc.auditEvents.list.infiniteQueryOptions(
      {
        scope,
        limit: 25,
        action: action || undefined,
        result: result || undefined,
        excludeDenied: result === "denied" ? false : undefined,
      },
      { getNextPageParam: (last) => last.nextCursor },
    ),
  );

  const rows = useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data],
  );
  const items = useMemo(
    () =>
      rows.map((row) =>
        auditRowToActivityItem(row, {
          projectHref: (slug, orgSlug) =>
            orgSlug || org ? routes.project(orgSlug || org, slug) : null,
        }),
      ),
    [rows, org],
  );
  const [seenActions, setSeenActions] = useState<string[]>([]);
  const actionOptions = useMemo(() => {
    const set = new Set([...seenActions, ...rows.map((r) => r.action)]);
    if (action) set.add(action);
    return [...set]
      .sort()
      .map((value) => ({ value, label: formatActionLabel(value) }));
  }, [rows, seenActions, action]);

  if (query.error) {
    return (
      <ErrorState
        title="Could not load activity"
        description={query.error.message}
        onRetry={() => query.refetch()}
      />
    );
  }

  return (
    <ActivityTimeline
      filtersInHeader
      items={items}
      loading={query.isLoading}
      actionOptions={actionOptions}
      action={action}
      onActionChange={(v) => {
        setSeenActions(actionOptions.map((o) => o.value));
        setAction(v);
      }}
      result={result}
      onResultChange={setResult}
      hasMore={query.hasNextPage}
      loadingMore={query.isFetchingNextPage}
      onLoadMore={() => void query.fetchNextPage()}
      LinkComponent={({ href, className, children }) => (
        <Link href={href as never} className={className}>
          {children}
        </Link>
      )}
      empty={
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {scope === "org" && !unassignedLoading && unassigned
                ? CONTACT_MANAGER_TITLE
                : "No activity yet"}
            </EmptyTitle>
            <EmptyDescription>
              {scope === "org" && !unassignedLoading && unassigned
                ? CONTACT_MANAGER_DESCRIPTION
                : action || result
                  ? "No events match these filters."
                  : "Changes in this organization will appear here."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
    />
  );
}
