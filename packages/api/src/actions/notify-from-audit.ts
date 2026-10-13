/** Bridge registry notifyOn → @env-manager/notifications (invitation types today). */
export async function notifyFromAuditEvent(_input: {
  auditEventId: string;
  action: string;
  notifyTypes: string[];
  actorUserId: string;
  organizationId?: string | null;
  entityId?: string | null;
  payload?: Record<string, unknown>;
}) {
  // Invitation notifications are still emitted from Better Auth hooks.
  // Future: dispatch additional types from successful audit_event rows.
}
