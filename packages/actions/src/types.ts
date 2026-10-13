export type OrgRole = "owner" | "manager" | "member";

/** Legacy Better Auth org role stored in DB before migration */
export type StoredMemberRole = OrgRole | "admin";

export type ActionScope = "platform" | "organization" | "project" | "user";

export type ActionAuditConfig = {
  entityType: string;
  capturePayload?: "none" | "diff" | "metadata";
  severity?: "info" | "security" | "critical";
};

export type ActionDefinition = {
  name: string;
  scope: ActionScope;
  description: string;
  selfOnly?: boolean;
  /** Minimum org roles when scope is organization or project (before grants) */
  orgRoles?: OrgRole[];
  requiresProjectGrant?: boolean;
  projectGrantKey?: string;
  baPermission?: Record<string, string[]>;
  implies?: string[];
  audit: ActionAuditConfig;
  notifyOn?: string[];
  ui?: { label?: string; surface?: string };
};

import type { actionNames } from "./registry-data";

export type ActionName = (typeof actionNames)[number];
