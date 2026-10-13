import { isActionsAuditEnabled } from "@env-manager/actions";
import { requireAction } from "../actions/require-action";

export function toIsoString(value: Date | string | null | undefined): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value == null) {
    return "";
  }
  return String(value);
}

export async function assertPlatformOperatorList(
  userId: string,
): Promise<void> {
  if (isActionsAuditEnabled()) {
    await requireAction("platform.user.list", { userId });
  }
}

export async function assertPlatformSetRole(
  operatorUserId: string,
  targetUserId: string,
): Promise<void> {
  if (isActionsAuditEnabled()) {
    await requireAction("platform.user.set_role", {
      userId: operatorUserId,
      targetUserId,
    });
  }
}

export async function assertPlatformSupportManagerChange(
  operatorUserId: string,
  targetUserId: string,
  grant: boolean,
): Promise<void> {
  if (isActionsAuditEnabled()) {
    await requireAction(
      grant
        ? "platform.support.grant_manager"
        : "platform.support.revoke_manager",
      {
        userId: operatorUserId,
        targetUserId,
      },
    );
  }
}
