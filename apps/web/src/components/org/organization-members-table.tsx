"use client";

import {
  type LegacyColumnDef,
  legacyCreateColumnHelper,
} from "@tanstack/react-table/legacy";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

export function OrganizationMembersTable({
  members,
  roleSelectItems,
  isOwner,
  rolePendingId,
  onRoleChange,
}: OrganizationMembersTableProps) {
  const columns = [
    columnHelper.accessor((row) => row.user.name, {
      id: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Member" />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.user.name}{" "}
          <span className="text-muted-foreground">
            ({row.original.user.email})
          </span>
        </span>
      ),
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
      emptyMessage="No members yet."
    />
  );
}
