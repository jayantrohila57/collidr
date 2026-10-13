"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";

type TicketRow = {
  id: string;
  ticketNumber: number;
  subject: string;
  status: string;
  priority: string;
  updatedAt: string;
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
      <Link href={`/tickets/${row.original.id}`} className="hover:underline">
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

export default function TicketsPage() {
  const tickets = useQuery(trpc.support.listTickets.queryOptions({}));
  const access = useQuery(trpc.support.accessStatus.queryOptions());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-semibold text-2xl">My tickets</h1>
        <div className="flex gap-2">
          {access.data?.isSupportManager ? (
            <Button variant="outline" render={<Link href="/manage/tickets" />}>
              Manager queue
            </Button>
          ) : null}
          <Button render={<Link href="/tickets/new" />}>New ticket</Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={tickets.data?.items ?? []}
        isLoading={tickets.isLoading}
      />
    </div>
  );
}
