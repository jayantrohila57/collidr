"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { Route } from "next";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { ConsolePageHeader } from "@/domain/console/components/console-page-header";
import { trpc } from "@/utils/trpc";

type TicketRow = {
  id: string;
  ticketNumber: number;
  subject: string;
  status: string;
  priority: string;
  requesterUserId: string;
};

const columns: DataTableColumnDef<TicketRow>[] = [
  {
    accessorKey: "ticketNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    cell: ({ row }) => `#${row.original.ticketNumber}`,
  },
  {
    accessorKey: "subject",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Subject" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/dashboard/support/tickets/${row.original.id}` as Route}
        className="hover:underline"
      >
        {row.original.subject}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.status.replace("_", " ")}</Badge>
    ),
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
  },
];

export default function ConsoleSupportTicketsPage() {
  const tickets = useQuery(
    trpc.support.listTickets.queryOptions({
      sortBy: "updatedAt",
      sortDir: "desc",
      limit: 50,
    }),
  );

  return (
    <div className="space-y-4">
      <ConsolePageHeader
        title="Support queue"
        description="All tickets — reply, assign, and change status."
      />
      <DataTable
        columns={columns}
        data={tickets.data?.items ?? []}
        isLoading={tickets.isLoading}
      />
    </div>
  );
}
