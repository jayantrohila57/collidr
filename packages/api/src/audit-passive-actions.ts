import { auditEvent } from "@loftlancer/db/schema/audit-event";
import { not, or, type SQL, sql } from "drizzle-orm";

/** Low-signal actions hidden from timeline by default (reads and views). */
export function isPassiveAuditAction(action: string): boolean {
  return (
    action.endsWith(".read") ||
    action.includes(".view.") ||
    action.endsWith(".view")
  );
}

export function passiveActionSqlFilter(): SQL {
  const passive = or(
    sql`${auditEvent.action} like '%.read'`,
    sql`${auditEvent.action} like '%.view.%'`,
    sql`${auditEvent.action} like '%.view'`,
  );
  if (!passive) {
    throw new Error("passiveActionSqlFilter: expected non-empty OR clause");
  }
  return not(passive);
}
