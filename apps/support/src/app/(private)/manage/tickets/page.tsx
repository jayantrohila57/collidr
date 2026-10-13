"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
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

export default function ManageTicketsPage() {
  const router = useRouter();
  const access = useQuery(trpc.support.accessStatus.queryOptions());
  const tickets = useQuery(
    trpc.support.listTickets.queryOptions({
      sortBy: "updatedAt",
      sortDir: "desc",
      limit: 50,
    }),
  );

  useEffect(() => {
    if (access.isSuccess && !access.data?.isSupportManager) {
      router.replace("/tickets");
    }
  }, [access.data, access.isSuccess, router]);

  if (!access.data?.isSupportManager) {
    return (
      <p className="text-muted-foreground text-sm">Checking manager access…</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-semibold text-2xl">Support queue</h1>
        <Link href="/manage/faq" className="text-sm underline">
          Manage FAQ
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={tickets.data?.items ?? []}
        isLoading={tickets.isLoading}
      />
    </div>
  );
}
