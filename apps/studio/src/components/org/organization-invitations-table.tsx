"use client";

import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTable } from "@/components/data-table/data-table";
import {
  DATA_TABLE_ACTIONS_COLUMN_ID,
  DataTableActionsColumnHeader,
} from "@/components/data-table/data-table-actions-column";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DataTableEmptyConfig } from "@/components/data-table/data-table-empty-types";
import { RoleBadge, StatusBadge } from "@/components/patterns/status-badge";
import { Button } from "@/components/ui/button";
import { Can } from "@/domain/permissions/components/can";
import { formatDateTime } from "@/lib/format";
import {
  isPendingInvitationStatus,
  type OrganizationInvitationRow,
} from "@/lib/organization-invitations";

const columnHelper = legacyCreateColumnHelper<OrganizationInvitationRow>();

export type OrganizationInvitationsTableProps = {
  invitations: OrganizationInvitationRow[];
  empty?: DataTableEmptyConfig;
  revokingId: string | null;
  resendingId: string | null;
  onRevoke: (invitationId: string) => void;
  onResend: (invite: OrganizationInvitationRow) => void;
  /** Off when the caller paginates server-side (#261). */
  clientPagination?: boolean;
};

export function OrganizationInvitationsTable({
  invitations,
  empty,
  revokingId,
  resendingId,
  onRevoke,
  onResend,
  clientPagination = true,
}: OrganizationInvitationsTableProps) {
  const columns: DataTableColumnDef<OrganizationInvitationRow>[] = [
    columnHelper.accessor("email", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ getValue }) => (
        <span className="font-medium">{String(getValue())}</span>
      ),
    }),
    columnHelper.accessor("role", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ getValue }) => <RoleBadge role={String(getValue())} />,
    }),
    columnHelper.accessor("status", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ getValue }) => <StatusBadge status={String(getValue())} />,
    }),
    columnHelper.accessor("expiresAt", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expires" />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-xs">
          {formatDateTime(String(getValue()))}
        </span>
      ),
    }),
    columnHelper.display({
      id: DATA_TABLE_ACTIONS_COLUMN_ID,
      meta: { role: "actions" },
      header: () => <DataTableActionsColumnHeader />,
      cell: ({ row }) => {
        const invite = row.original;
        if (!isPendingInvitationStatus(invite.status)) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }
        return (
          <Can action="member.invite" fallback={null}>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={resendingId === invite.id || revokingId === invite.id}
                onClick={() => onResend(invite)}
              >
                Resend
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={revokingId === invite.id || resendingId === invite.id}
                onClick={() => onRevoke(invite.id)}
              >
                Revoke
              </Button>
            </div>
          </Can>
        );
      },
    }),
  ];

  return (
    <DataTable
      columns={columns}
      data={invitations}
      caption="Organization invitations"
      captionSrOnly
      empty={empty}
      framed
      compactLayout
      enablePagination={clientPagination}
      pageSize={10}
    />
  );
}
