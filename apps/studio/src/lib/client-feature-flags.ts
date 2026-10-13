import { FEATURE_FLAG_PAIRS } from "@collidr/env/feature-flags";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { isVariablesV2EnabledOnClient } from "@/lib/variables-v2-enabled";

const clientReaders: Record<string, () => boolean> = {
  organizations: isOrganizationsEnabledOnClient,
  notifications: isNotificationsEnabledOnClient,
  "variables-v2": isVariablesV2EnabledOnClient,
  "actions-audit": isActionsAuditEnabledOnClient,
};

export type ClientFeatureFlagRow = {
  id: string;
  label: string;
  clientKey: string;
  clientEnabled: boolean;
};

export function readClientFeatureFlags(): ClientFeatureFlagRow[] {
  return FEATURE_FLAG_PAIRS.map((pair) => ({
    id: pair.id,
    label: pair.label,
    clientKey: pair.clientKey,
    clientEnabled: clientReaders[pair.id]?.() ?? false,
  }));
}
