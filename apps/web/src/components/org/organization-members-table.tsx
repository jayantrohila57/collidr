"use client";

import {
  type LegacyColumnDef,
  legacyCreateColumnHelper,
} from "@tanstack/react-table/legacy";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DataTableEmptyConfig } from "@/components/data-table/data-table-empty-types";
import { TableLeadingCell } from "@/components/patterns/table-leading-cell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { initialsFromLabel } from "@/lib/initials";

export type OrganizationMemberRow = {
  id: string;
  role: string;
  user: { name: string; email: string; id?: string };
};

const ROLES = ["member", "admin", "owner"] as const;

const columnHelper = legacyCreateColumnHelper<OrganizationMemberRow>();

interface OrganizationMembersTableProps {
  members: OrganizationMemberRow[];
  roleSelectItems: { value: string; label: string }[];
  isOwner: boolean;
  rolePendingId: string | null;
  onRoleChange: (memberId: string, role: string) => void;
  empty?: DataTableEmptyConfig;
}

export function OrganizationMembersTable({
  members,
  roleSelectItems,
  isOwner,
  rolePendingId,
  onRoleChange,
  empty,
}: OrganizationMembersTableProps) {
  const columns = [
    columnHelper.accessor((row) => row.user.name, {
      id: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Member" />
      ),
      cell: ({ row }) => {
        const member = row.original;
        const label = member.user.name || member.user.email;
        return (
          <TableLeadingCell
            leading={
              <Avatar className="size-7">
                <AvatarFallback className="bg-muted font-medium text-[10px]">
                  {initialsFromLabel(label, "MB")}
                </AvatarFallback>
              </Avatar>
            }
          >
            <span className="block truncate font-medium">
              {member.user.name}
            </span>
            <span className="block truncate text-muted-foreground text-xs">
              {member.user.email}
            </span>
          </TableLeadingCell>
        );
      },
    }),
    columnHelper.accessor("role", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const member = row.original;
        return (
          <Select
            value={member.role}
            items={roleSelectItems}
            onValueChange={(role) => {
              if (role) onRoleChange(member.id, role);
            }}
            disabled={rolePendingId === member.id || !isOwner}
          >
            <SelectTrigger aria-label={`Role for ${member.user.email}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    }),
  ] as LegacyColumnDef<OrganizationMemberRow, unknown>[];

  return (
    <DataTable
      columns={columns}
      data={members}
      caption="Organization members"
      captionSrOnly
      empty={empty}
      framed
      compactLayout
      searchable
      searchPlaceholder="Search members…"
      enablePagination
      pageSize={10}
    />
  );
}
