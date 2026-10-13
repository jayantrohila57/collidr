"use client";

import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { format } from "date-fns";
import type { ReactNode } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DataTableEmptyConfig } from "@/components/data-table/data-table-empty-types";
import { AppIcon } from "@/components/patterns/app-icon";
import { TableLeadingCell } from "@/components/patterns/table-leading-cell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AppIconName } from "@/lib/icons";

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
  isLoading?: boolean;
  revealedIds: Set<string>;
  onToggleReveal: (id: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filter?: ReactNode;
  filterActive?: boolean;
  empty?: DataTableEmptyConfig;
}

function auditEntityIcon(entityType: string): AppIconName {
  switch (entityType) {
    case "VARIABLE":
      return "variable";
    case "ENVIRONMENT":
      return "environment";
    case "PROJECT":
      return "project";
    default:
      return "activity";
  }
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
  isLoading = false,
  revealedIds,
  onToggleReveal,
  searchValue,
  onSearchChange,
  filter,
  filterActive = false,
  empty,
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
        cell: ({ row, getValue }) => (
          <TableLeadingCell
            leading={
              <AppIcon
                name={auditEntityIcon(row.original.entityType)}
                className="text-muted-foreground"
              />
            }
          >
            <Badge variant={entityTypeVariants[getValue()] || "secondary"}>
              {getValue()}
            </Badge>
          </TableLeadingCell>
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
                <AppIcon
                  name={revealedIds.has(log.id) ? "hide" : "reveal"}
                  className="text-foreground"
                />
              </Button>
            </div>
          );
        },
      }),
    ];

  return (
    <DataTable
      columns={columns}
      data={logs}
      isLoading={isLoading}
      caption="Audit log"
      framed
      searchPlaceholder="Search logs…"
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      filter={filter}
      enablePagination
      pageSize={20}
      filterActive={filterActive}
      empty={empty}
      captionSrOnly
    />
  );
}
