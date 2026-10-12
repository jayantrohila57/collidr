"use client";

import { format } from "date-fns";
import { Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export function AuditLogTableView({
  logs,
  status,
  revealedIds,
  onToggleReveal,
}: AuditLogTableViewProps) {
  if (status === "loading") return <AuditSkeleton />;
  if (status === "error") {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Failed to load logs.
      </div>
    );
  }
  if (status === "empty") {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        No audit logs found.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-mono text-xs">
                {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm")}
              </TableCell>
              <TableCell>
                <Badge variant={actionVariants[log.action] || "secondary"}>
                  {log.action}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={entityTypeVariants[log.entityType] || "secondary"}
                >
                  {log.entityType}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                <div className="flex items-center justify-between">
                  <span className="truncate">{getEntityDescription(log)}</span>
                  <button
                    type="button"
                    onClick={() => onToggleReveal(log.id)}
                    className="rounded p-1 hover:bg-muted"
                  >
                    {revealedIds.has(log.id) ? (
                      <EyeOff size={14} />
                    ) : (
                      <Eye size={14} />
                    )}
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
