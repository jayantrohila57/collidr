"use client";

import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/patterns/error-state";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

type TimelinePageClientProps = {
  scope: "org" | "self";
};

export function TimelinePageClient({ scope }: TimelinePageClientProps) {
  const query = useQuery(
    trpc.auditEvents.list.queryOptions({
      scope,
      limit: 50,
    }),
  );

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

  const items = query.data?.items ?? [];

  if (!items.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>
            {scope === "org"
              ? "No timeline events yet"
              : "No activity on your account"}
          </EmptyTitle>
          <EmptyDescription>
            {scope === "org"
              ? "Contact your manager to get assigned to a team or project if you expected to see organization activity here."
              : "Actions you take in the app will appear here."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>When</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Result</TableHead>
          <TableHead>Entity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="text-muted-foreground text-xs">
              {formatDateTime(String(row.createdAt))}
            </TableCell>
            <TableCell className="font-mono text-xs">{row.action}</TableCell>
            <TableCell>{row.result}</TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {row.entitySlug ?? row.entityType}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
