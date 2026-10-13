"use client";

import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { format } from "date-fns";
import { Eye, EyeOff } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuditSkeleton } from "./skeletons";

const actionVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  CREATE: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
  BULK_IMPORT: "outline",
  EXPORT: "outline",
};

const entityTypeVariants: Record<string, "default" | "secondary" | "outline"> =
  {
    VARIABLE: "default",
    ENVIRONMENT: "secondary",
    PROJECT: "outline",
  };

interface AuditLog {
  id: string;
  createdAt: string | Date;
  action: string;
  entityType: string;
  variableId?: string | null;
  environmentId?: string | null;
  projectId?: string | null;
  oldValue: string | null;
  newValue: string | null;
}

interface AuditLogTableViewProps {
  logs: AuditLog[];
  status: "loading" | "error" | "empty" | "success";
  revealedIds: Set<string>;
  onToggleReveal: (id: string) => void;
}

const getEntityDescription = (log: AuditLog) => {
  if (log.variableId) return `Variable: ${log.variableId.slice(0, 8)}...`;
  if (log.environmentId)
    return `Environment: ${log.environmentId.slice(0, 8)}...`;
  if (log.projectId) return `Project: ${log.projectId.slice(0, 8)}...`;
  return "System operation";
};

const columnHelper = legacyCreateColumnHelper<AuditLog>();

export function AuditLogTableView({
  logs,
  status,
  revealedIds,
  onToggleReveal,
}: AuditLogTableViewProps) {
  const columns: import("@/components/data-table/data-table").DataTableColumnDef<AuditLog>[] =
    [
      columnHelper.accessor("createdAt", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs">
            {format(new Date(getValue()), "MMM dd, yyyy HH:mm")}
          </span>
        ),
      }),
      columnHelper.accessor("action", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Action" />
        ),
        cell: ({ getValue }) => (
          <Badge variant={actionVariants[getValue()] || "secondary"}>
            {getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("entityType", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Entity" />
        ),
        cell: ({ getValue }) => (
          <Badge variant={entityTypeVariants[getValue()] || "secondary"}>
            {getValue()}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: "details",
        header: "Details",
        enableSorting: false,
        cell: ({ row }) => {
          const log = row.original;
          return (
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">{getEntityDescription(log)}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onToggleReveal(log.id)}
                aria-label={
                  revealedIds.has(log.id) ? "Hide details" : "Reveal details"
                }
              >
                {revealedIds.has(log.id) ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
            </div>
          );
        },
      }),
    ];

  if (status === "loading") return <AuditSkeleton />;
  if (status === "error") {
    return (
      <DataTable
        columns={columns}
        data={[]}
        emptyMessage="Failed to load logs."
      />
    );
  }
  if (status === "empty") {
    return (
      <DataTable
        columns={columns}
        data={[]}
        emptyMessage="No audit logs found."
      />
    );
  }

  return <DataTable columns={columns} data={logs} caption="Audit log" framed />;
}
