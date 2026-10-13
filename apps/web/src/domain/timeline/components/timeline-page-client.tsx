"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { ErrorState } from "@/components/patterns/error-state";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CONTACT_MANAGER_DESCRIPTION,
  CONTACT_MANAGER_TITLE,
} from "@/domain/permissions/contact-manager";
import { useUnassignedOrgMember } from "@/domain/permissions/hooks/use-permissions";
import { formatDateTime } from "@/lib/format";
import { formatActionLabel } from "@/lib/format-action-label";
import { layoutSectionStackClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

type TimelinePageClientProps = {
  scope: "org" | "self";
};

const RESULT_OPTIONS = [
  { value: "success" as const, label: "Success" },
  { value: "failure" as const, label: "Failure" },
  { value: "denied" as const, label: "Denied" },
];

function formatActorLabel(row: {
  actorName: string | null;
  actorEmail: string | null;
  actorUserId: string | null;
}): string {
  return row.actorName ?? row.actorEmail ?? row.actorUserId ?? "Unknown";
}

function formatProjectLabel(row: {
  projectName: string | null;
  projectSlug: string | null;
  projectId: string | null;
}): string | null {
  if (!row.projectId) return null;
  return row.projectName ?? row.projectSlug ?? row.projectId;
}

export function TimelinePageClient({ scope }: TimelinePageClientProps) {
  const { unassigned, isLoading: unassignedLoading } = useUnassignedOrgMember();
  const [resultFilter, setResultFilter] = useState<
    ("success" | "failure" | "denied")[]
  >([]);
  const [includePassive, setIncludePassive] = useState(false);

  const result = resultFilter.length === 1 ? resultFilter[0] : undefined;

  const query = useQuery(
    trpc.auditEvents.list.queryOptions({
      scope,
      limit: 50,
      excludePassive: !includePassive,
      result,
    }),
  );

  const items = query.data?.items ?? [];

  const actionOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of items) {
      counts.set(row.action, (counts.get(row.action) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({
        value,
        label: formatActionLabel(value),
        count,
      }));
  }, [items]);

  const [actionFilter, setActionFilter] = useState<string[]>([]);
  const [actorFilter, setActorFilter] = useState<string[]>([]);
  const [projectFilter, setProjectFilter] = useState<string[]>([]);

  const actorOptions = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const row of items) {
      const value = row.actorUserId ?? "";
      if (!value) continue;
      const label = formatActorLabel(row);
      const prev = counts.get(value);
      counts.set(value, {
        label,
        count: (prev?.count ?? 0) + 1,
      });
    }
    return [...counts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .map(([value, { label, count }]) => ({
        value,
        label,
        count,
      }));
  }, [items]);

  const projectOptions = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const row of items) {
      if (!row.projectId) continue;
      const label = formatProjectLabel(row);
      if (!label) continue;
      const prev = counts.get(row.projectId);
      counts.set(row.projectId, {
        label,
        count: (prev?.count ?? 0) + 1,
      });
    }
    return [...counts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .map(([value, { label, count }]) => ({
        value,
        label,
        count,
      }));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((row) => {
      if (actionFilter.length && !actionFilter.includes(row.action)) {
        return false;
      }
      if (
        actorFilter.length &&
        (!row.actorUserId || !actorFilter.includes(row.actorUserId))
      ) {
        return false;
      }
      if (
        projectFilter.length &&
        (!row.projectId || !projectFilter.includes(row.projectId))
      ) {
        return false;
      }
      return true;
    });
  }, [actionFilter, actorFilter, items, projectFilter]);

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (query.error) {
    return (
      <ErrorState
        title="Could not load timeline"
        description={query.error.message}
        onRetry={() => query.refetch()}
      />
    );
  }

  return (
    <div className={cn(layoutSectionStackClass)}>
      <div className="flex flex-wrap items-center gap-2">
        <DataTableFacetedFilter
          title="Result"
          options={RESULT_OPTIONS}
          value={resultFilter}
          onValueChange={(value) =>
            setResultFilter(value as ("success" | "failure" | "denied")[])
          }
          multiple={false}
          searchable={false}
        />
        {actionOptions.length > 0 ? (
          <DataTableFacetedFilter
            title="Action"
            options={actionOptions}
            value={actionFilter}
            onValueChange={setActionFilter}
            multiple
            searchable
          />
        ) : null}
        {scope === "org" && actorOptions.length > 0 ? (
          <DataTableFacetedFilter
            title="Actor"
            options={actorOptions}
            value={actorFilter}
            onValueChange={setActorFilter}
            multiple
            searchable
          />
        ) : null}
        {projectOptions.length > 0 ? (
          <DataTableFacetedFilter
            title="Project"
            options={projectOptions}
            value={projectFilter}
            onValueChange={setProjectFilter}
            multiple
            searchable
          />
        ) : null}
        <div className="flex items-center gap-2 rounded-md border px-3 py-1.5">
          <Switch
            id="timeline-include-passive"
            checked={includePassive}
            onCheckedChange={setIncludePassive}
          />
          <Label
            htmlFor="timeline-include-passive"
            className="text-muted-foreground text-xs"
          >
            Show views & reads
          </Label>
        </div>
      </div>

      {!filteredItems.length ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {scope === "org" && !unassignedLoading && unassigned
                ? CONTACT_MANAGER_TITLE
                : scope === "org"
                  ? "No timeline events yet"
                  : "No activity on your account"}
            </EmptyTitle>
            <EmptyDescription>
              {scope === "org" && !unassignedLoading && unassigned
                ? CONTACT_MANAGER_DESCRIPTION
                : scope === "org"
                  ? "Try enabling views & reads or adjusting filters."
                  : "Actions you take in the app will appear here."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Entity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDateTime(String(row.createdAt))}
                </TableCell>
                <TableCell className="text-xs">
                  {formatActorLabel(row)}
                </TableCell>
                <TableCell className="text-sm">
                  {formatActionLabel(row.action)}
                </TableCell>
                <TableCell>{row.result}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatProjectLabel(row) ?? row.entitySlug ?? row.entityType}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
