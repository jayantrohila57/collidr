import { Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const badgeClassName = "gap-1.5 font-normal capitalize";

type DotTone = "success" | "muted" | "warning" | "destructive" | "info";

const DOT_CLASS: Record<DotTone, string> = {
  success: "bg-success",
  muted: "bg-muted-foreground/70",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
};

function StatusDot({ tone }: { tone: DotTone }) {
  return (
    <span
      className={cn("size-1.5 shrink-0 rounded-full", DOT_CLASS[tone])}
      aria-hidden
    />
  );
}

function formatLabel(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "bulk_import") return "Bulk import";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function resolveStatus(value: string): { label: string; tone: DotTone } {
  const key = value.trim().toLowerCase();

  switch (key) {
    case "active":
      return { label: "Active", tone: "success" };
    case "inactive":
      return { label: "Inactive", tone: "muted" };
    case "maintenance":
      return { label: "Maintenance", tone: "warning" };
    case "archived":
      return { label: "Archived", tone: "muted" };
    case "building":
      return { label: "Building", tone: "info" };
    case "failed":
      return { label: "Failed", tone: "destructive" };
    case "create":
      return { label: "Create", tone: "success" };
    case "update":
      return { label: "Update", tone: "info" };
    case "delete":
      return { label: "Delete", tone: "destructive" };
    case "bulk_import":
      return { label: "Bulk import", tone: "muted" };
    case "export":
      return { label: "Export", tone: "muted" };
    case "variable":
      return { label: "Variable", tone: "info" };
    case "environment":
      return { label: "Environment", tone: "success" };
    case "project":
      return { label: "Project", tone: "muted" };
    default:
      return { label: formatLabel(value), tone: "muted" };
  }
}

function OutlineStatusBadge({
  label,
  tone,
  className,
  leading,
}: {
  label: string;
  tone?: DotTone;
  leading?: "dot" | "globe" | "lock";
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      size="sm"
      className={cn(badgeClassName, className)}
    >
      {leading === "globe" ? (
        <Globe className="size-3.5 shrink-0 opacity-80" aria-hidden />
      ) : null}
      {leading === "lock" ? (
        <Lock className="size-3.5 shrink-0 opacity-80" aria-hidden />
      ) : null}
      {leading === "dot" && tone ? <StatusDot tone={tone} /> : null}
      {label}
    </Badge>
  );
}

/** Operational / lifecycle status (outline + colored dot). */
export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const { label, tone } = resolveStatus(status);
  return (
    <OutlineStatusBadge
      label={label}
      tone={tone}
      leading="dot"
      className={className}
    />
  );
}

/** Public / private visibility (outline + globe or lock icon). */
export function VisibilityBadge({
  isPublic,
  className,
}: {
  isPublic: boolean;
  className?: string;
}) {
  return (
    <OutlineStatusBadge
      label={isPublic ? "Public" : "Private"}
      leading={isPublic ? "globe" : "lock"}
      className={className}
    />
  );
}

/** Organization member role (secondary, no dot). */
export function RoleBadge({
  role,
  className,
}: {
  role: string;
  className?: string;
}) {
  const normalized = role.trim().toLowerCase();
  const label =
    normalized === "owner"
      ? "Owner"
      : normalized === "manager"
        ? "Manager"
        : normalized === "admin"
          ? "Admin"
          : normalized === "member"
            ? "Member"
            : formatLabel(role);

  return (
    <OutlineStatusBadge label={label} tone="muted" className={className} />
  );
}

/** Audit log action column. */
export function AuditActionBadge({
  action,
  className,
}: {
  action: string;
  className?: string;
}) {
  const { label, tone } = resolveStatus(action);
  return (
    <OutlineStatusBadge
      label={label}
      tone={tone}
      leading="dot"
      className={className}
    />
  );
}

/** Audit log entity type column. */
export function AuditEntityBadge({
  entityType,
  className,
}: {
  entityType: string;
  className?: string;
}) {
  const { label, tone } = resolveStatus(entityType);
  return (
    <OutlineStatusBadge
      label={label}
      tone={tone}
      leading="dot"
      className={className}
    />
  );
}
