import type { ActionDefinition, OrgRole } from "./types";

type MatrixRow = {
  name: string;
  scope: ActionDefinition["scope"];
  description: string;
  owner?: boolean;
  manager?: boolean | "grant";
  member?: boolean | "grant";
  orgOnly?: OrgRole[];
  selfOnly?: boolean;
  requiresProjectGrant?: boolean;
  projectGrantKey?: string;
  notifyOn?: string[];
  entityType: string;
  severity?: ActionDefinition["audit"]["severity"];
};

const orgManagerMember: OrgRole[] = ["owner", "manager", "member"];
const orgOwnerManager: OrgRole[] = ["owner", "manager"];
const orgOwnerOnly: OrgRole[] = ["owner"];

function orgRolesFromRow(row: MatrixRow): OrgRole[] | undefined {
  if (row.orgOnly) return row.orgOnly;
  if (row.scope === "user" || row.scope === "platform") return undefined;
  if (row.member === true) return orgManagerMember;
  if (row.manager === true || row.manager === "grant") return orgOwnerManager;
  if (row.owner) return orgOwnerOnly;
  return orgOwnerOnly;
}

function def(row: MatrixRow): ActionDefinition {
  const orgRoles = orgRolesFromRow(row);

  return {
    name: row.name,
    scope: row.scope,
    description: row.description,
    selfOnly: row.selfOnly,
    orgRoles,
    requiresProjectGrant:
      row.requiresProjectGrant ??
      (row.manager === "grant" || row.member === "grant"),
    projectGrantKey: row.projectGrantKey ?? row.name,
    audit: {
      entityType: row.entityType,
      severity: row.severity,
      capturePayload: "metadata",
    },
    notifyOn: row.notifyOn,
  };
}

const rows: MatrixRow[] = [
  {
    name: "platform.user.list",
    scope: "platform",
    description: "List users (platform admin)",
    entityType: "user",
  },
  {
    name: "platform.user.set_role",
    scope: "platform",
    description: "Set platform user role",
    entityType: "user",
  },
  {
    name: "platform.user.impersonate",
    scope: "platform",
    description: "Impersonate user",
    entityType: "user",
    severity: "critical",
  },
  {
    name: "organization.create",
    scope: "organization",
    description: "Create organization",
    owner: true,
    entityType: "organization",
  },
  {
    name: "organization.update",
    scope: "organization",
    description: "Update organization",
    owner: true,
    entityType: "organization",
  },
  {
    name: "organization.delete",
    scope: "organization",
    description: "Delete organization",
    owner: true,
    entityType: "organization",
    severity: "critical",
  },
  {
    name: "organization.list",
    scope: "organization",
    description: "List organizations",
    member: true,
    entityType: "organization",
  },
  {
    name: "organization.view",
    scope: "organization",
    description: "View organization",
    member: true,
    entityType: "organization",
  },
  {
    name: "organization.hub.view",
    scope: "organization",
    description: "View organization hub",
    member: true,
    entityType: "organization",
  },
  {
    name: "organization.transfer_ownership",
    scope: "organization",
    description: "Transfer organization ownership",
    owner: true,
    entityType: "organization",
    severity: "security",
  },
  {
    name: "organization.settings.view",
    scope: "organization",
    description: "View organization settings",
    manager: true,
    entityType: "organization",
  },
  {
    name: "organization.settings.update",
    scope: "organization",
    description: "Update organization settings",
    owner: true,
    entityType: "organization",
  },
  {
    name: "organization.restore",
    scope: "organization",
    description: "Restore soft-deleted organization",
    owner: true,
    entityType: "organization",
  },
  {
    name: "member.list",
    scope: "organization",
    description: "List organization members",
    manager: true,
    entityType: "member",
  },
  {
    name: "member.invite",
    scope: "organization",
    description: "Invite member to organization",
    manager: true,
    entityType: "invitation",
    notifyOn: ["invitation.received"],
    severity: "security",
  },
  {
    name: "member.remove",
    scope: "organization",
    description: "Remove organization member",
    owner: true,
    entityType: "member",
    severity: "security",
  },
  {
    name: "member.role.update",
    scope: "organization",
    description: "Update member role",
    owner: true,
    entityType: "member",
    severity: "security",
  },
  {
    name: "invitation.accept",
    scope: "organization",
    description: "Accept invitation",
    member: true,
    entityType: "invitation",
  },
  {
    name: "invitation.reject",
    scope: "organization",
    description: "Reject invitation",
    member: true,
    entityType: "invitation",
  },
  {
    name: "invitation.cancel",
    scope: "organization",
    description: "Cancel invitation",
    owner: true,
    entityType: "invitation",
  },
  {
    name: "team.create",
    scope: "organization",
    description: "Create team",
    manager: true,
    entityType: "team",
  },
  {
    name: "team.update",
    scope: "organization",
    description: "Update team",
    manager: true,
    entityType: "team",
  },
  {
    name: "team.delete",
    scope: "organization",
    description: "Delete team",
    manager: true,
    entityType: "team",
  },
  {
    name: "team.restore",
    scope: "organization",
    description: "Restore team",
    manager: true,
    entityType: "team",
  },
  {
    name: "team.member.add",
    scope: "organization",
    description: "Add member to team",
    manager: true,
    entityType: "team",
  },
  {
    name: "team.member.remove",
    scope: "organization",
    description: "Remove member from team",
    manager: true,
    entityType: "team",
  },
  {
    name: "project.create",
    scope: "organization",
    description: "Create project",
    owner: true,
    entityType: "project",
  },
  {
    name: "project.read",
    scope: "project",
    description: "Read project",
    manager: "grant",
    member: "grant",
    entityType: "project",
    projectGrantKey: "project.read",
  },
  {
    name: "project.update",
    scope: "project",
    description: "Update project",
    manager: "grant",
    member: "grant",
    entityType: "project",
    projectGrantKey: "project.update",
  },
  {
    name: "project.delete",
    scope: "organization",
    description: "Delete project",
    owner: true,
    entityType: "project",
  },
  {
    name: "project.restore",
    scope: "project",
    description: "Restore project",
    manager: "grant",
    entityType: "project",
    projectGrantKey: "project.restore",
  },
  {
    name: "project.archive",
    scope: "project",
    description: "Archive project",
    manager: "grant",
    entityType: "project",
    projectGrantKey: "project.archive",
  },
  {
    name: "project.status.change",
    scope: "project",
    description: "Change project status",
    manager: "grant",
    entityType: "project",
    projectGrantKey: "project.status.change",
  },
  {
    name: "project.public.toggle",
    scope: "project",
    description: "Toggle project public flag",
    manager: "grant",
    entityType: "project",
    projectGrantKey: "project.public.toggle",
  },
  {
    name: "project.assign_manager",
    scope: "organization",
    description: "Assign project manager",
    owner: true,
    entityType: "project",
  },
  {
    name: "project.assign_team",
    scope: "project",
    description: "Assign team to project",
    manager: "grant",
    entityType: "project",
    projectGrantKey: "project.assign_team",
  },
  {
    name: "project.permission.grant",
    scope: "project",
    description: "Grant project permissions to member",
    manager: "grant",
    entityType: "project",
    projectGrantKey: "project.permission.grant",
  },
  {
    name: "environment.create",
    scope: "project",
    description: "Create environment",
    manager: "grant",
    member: "grant",
    entityType: "environment",
    projectGrantKey: "environment.create",
  },
  {
    name: "environment.read",
    scope: "project",
    description: "Read environment",
    manager: "grant",
    member: "grant",
    entityType: "environment",
    projectGrantKey: "environment.read",
  },
  {
    name: "environment.update",
    scope: "project",
    description: "Update environment",
    manager: "grant",
    member: "grant",
    entityType: "environment",
    projectGrantKey: "environment.update",
  },
  {
    name: "environment.delete",
    scope: "project",
    description: "Delete environment",
    manager: "grant",
    entityType: "environment",
    projectGrantKey: "environment.delete",
  },
  {
    name: "environment.restore",
    scope: "project",
    description: "Restore environment",
    manager: "grant",
    entityType: "environment",
    projectGrantKey: "environment.restore",
  },
  {
    name: "variable.create",
    scope: "project",
    description: "Create variable",
    manager: "grant",
    member: "grant",
    entityType: "variable",
    projectGrantKey: "variable.create",
  },
  {
    name: "variable.read",
    scope: "project",
    description: "Read variable metadata",
    manager: "grant",
    member: "grant",
    entityType: "variable",
    projectGrantKey: "variable.read",
  },
  {
    name: "variable.update",
    scope: "project",
    description: "Update variable",
    manager: "grant",
    member: "grant",
    entityType: "variable",
    projectGrantKey: "variable.update",
  },
  {
    name: "variable.delete",
    scope: "project",
    description: "Delete variable",
    manager: "grant",
    member: "grant",
    entityType: "variable",
    projectGrantKey: "variable.delete",
  },
  {
    name: "variable.reveal",
    scope: "project",
    description: "Reveal secret variable value",
    manager: "grant",
    member: "grant",
    entityType: "variable",
    projectGrantKey: "variable.reveal",
    severity: "security",
  },
  {
    name: "variable.bulk_import",
    scope: "project",
    description: "Bulk import variables",
    manager: "grant",
    entityType: "variable",
    projectGrantKey: "variable.bulk_import",
  },
  {
    name: "variable.export",
    scope: "project",
    description: "Export variables",
    manager: "grant",
    member: "grant",
    entityType: "variable",
    projectGrantKey: "variable.export",
  },
  {
    name: "variable.restore",
    scope: "project",
    description: "Restore variable",
    manager: "grant",
    entityType: "variable",
    projectGrantKey: "variable.restore",
  },
  {
    name: "audit.timeline.view.org",
    scope: "organization",
    description: "View organization audit timeline",
    manager: "grant",
    entityType: "audit_event",
  },
  {
    name: "audit.timeline.view.project",
    scope: "project",
    description: "View project audit timeline",
    manager: "grant",
    member: "grant",
    entityType: "audit_event",
    projectGrantKey: "audit.timeline.view.project",
  },
  {
    name: "audit.timeline.view.user",
    scope: "organization",
    description: "View another user audit timeline",
    owner: true,
    entityType: "audit_event",
    severity: "security",
  },
  {
    name: "audit.timeline.view.self",
    scope: "user",
    description: "View own audit timeline",
    selfOnly: true,
    entityType: "audit_event",
  },
  {
    name: "notification.list",
    scope: "user",
    description: "List notifications",
    selfOnly: true,
    entityType: "notification",
  },
  {
    name: "notification.mark_read",
    scope: "user",
    description: "Mark notification read",
    selfOnly: true,
    entityType: "notification",
  },
  {
    name: "profile.view",
    scope: "user",
    description: "View profile settings",
    selfOnly: true,
    entityType: "user",
  },
  {
    name: "profile.update",
    scope: "user",
    description: "Update profile",
    selfOnly: true,
    entityType: "user",
  },
  {
    name: "session.list",
    scope: "user",
    description: "List sessions",
    selfOnly: true,
    entityType: "session",
  },
  {
    name: "session.revoke",
    scope: "user",
    description: "Revoke session",
    selfOnly: true,
    entityType: "session",
    severity: "security",
  },
  {
    name: "session.revoke_others",
    scope: "user",
    description: "Revoke other sessions",
    selfOnly: true,
    entityType: "session",
    severity: "security",
  },
  {
    name: "account.list",
    scope: "user",
    description: "List connected accounts",
    selfOnly: true,
    entityType: "account",
  },
  {
    name: "account.link",
    scope: "user",
    description: "Link OAuth account",
    selfOnly: true,
    entityType: "account",
  },
  {
    name: "account.unlink",
    scope: "user",
    description: "Unlink OAuth account",
    selfOnly: true,
    entityType: "account",
    severity: "security",
  },
  {
    name: "account.export",
    scope: "user",
    description: "Export user data",
    selfOnly: true,
    entityType: "user",
  },
  {
    name: "account.delete",
    scope: "user",
    description: "Delete account",
    selfOnly: true,
    entityType: "user",
    severity: "critical",
  },
];

export const actionDefinitions: ActionDefinition[] = rows.map(def);

export const actionNames = actionDefinitions.map((d) => d.name) as [
  string,
  ...string[],
];
