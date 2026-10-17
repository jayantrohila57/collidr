import type { ActionName } from "@loftlancer/actions";
import { isActionsAuditEnabled } from "@loftlancer/actions";
import { writeAuditEvent } from "../actions/audit-event-writer";

export async function auditSupportSuccess(
  action: ActionName,
  actorUserId: string,
  options: {
    entityId?: string;
    organizationId?: string | null;
    projectId?: string | null;
    targetUserId?: string | null;
    payload?: Record<string, unknown>;
  } = {},
): Promise<void> {
  if (!isActionsAuditEnabled()) {
    return;
  }
  await writeAuditEvent({
    action,
    result: "success",
    actorUserId,
    entityId: options.entityId,
    organizationId: options.organizationId,
    projectId: options.projectId,
    targetUserId: options.targetUserId,
    payload: options.payload,
  });
}
