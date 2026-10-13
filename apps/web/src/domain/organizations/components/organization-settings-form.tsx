"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  invitationsEmpty,
  membersTableEmpty,
} from "@/components/data-table/data-table-empty-presets";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { OrgSlugInput } from "@/components/org/org-slug-input";
import { OrganizationInvitationsTable } from "@/components/org/organization-invitations-table";
import { OrganizationMembersTable } from "@/components/org/organization-members-table";
import { AppIcon } from "@/components/patterns/app-icon";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";
import { ErrorState } from "@/components/patterns/error-state";
import { FormField } from "@/components/patterns/form-field";
import {
  FormSheet,
  FormSheetBody,
  FormSheetFooter,
  FormSheetForm,
  FormSheetHeader,
  FormSheetPopup,
} from "@/components/patterns/form-sheet";
import {
  SettingsPanel,
  SettingsRow,
  SettingsSectionHeader,
} from "@/components/patterns/settings-layout";
import { SettingsPanelSkeleton } from "@/components/patterns/settings-panel-skeleton";
import {
  SettingsTabs,
  SettingsTabsList,
  SettingsTabsPanel,
  SettingsTabsTab,
} from "@/components/patterns/settings-tabs";
import { SheetTitleWithIcon } from "@/components/patterns/sheet-title-with-icon";
import { SubmitButton } from "@/components/patterns/submit-button";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SheetClose, SheetDescription } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { useNotificationMutations } from "@/domain/notifications/hooks/use-notifications";
import { authClient } from "@/lib/auth-client";
import { isInviteMemberFormDirty } from "@/lib/form-dirty";
import { invalidateAfterOrganizationChange } from "@/lib/invalidate-org-queries";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";
import { isPersonalOrganization } from "@/lib/org-personal";
import {
  formatOrganizationCreateError,
  resolveOrgSlugForSave,
} from "@/lib/org-slug";
import {
  cancelOrganizationInvitation,
  type OrganizationInvitationRow,
  parseOrganizationInvitations,
  pendingOrganizationInvitations,
  resendOrganizationInvitation,
} from "@/lib/organization-invitations";
import { toast } from "@/lib/toast";

type MemberRow = {
  id: string;
  role: string;
  user: { name: string; email: string; id?: string };
};

const ROLES = ["member", "manager", "owner"] as const;

type OrgMemberRole = (typeof ROLES)[number];

const ROLE_SELECT_ITEMS = ROLES.map((role) => ({
  value: role,
  label: role,
}));

const ORG_TABS = ["general", "members", "danger"] as const;
type OrgTab = (typeof ORG_TABS)[number];

function readTabFromLocation(): OrgTab {
  if (typeof window === "undefined") return "general";
  const param = new URLSearchParams(window.location.search).get("tab");
  return ORG_TABS.includes(param as OrgTab) ? (param as OrgTab) : "general";
}

export type OrganizationSettingsMode =
  | "legacy-tabs"
  | "settings-hub"
  | "general"
  | "members"
  | "danger";

export function OrganizationSettingsForm({
  organizationId,
  mode = "legacy-tabs",
}: {
  organizationId: string;
  mode?: OrganizationSettingsMode;
}) {
  const router = useRouter();
  const [activeTab, setActiveTabState] = useState<OrgTab>(() => {
    if (mode === "members") return "members";
    if (mode === "danger") return "danger";
    return "general";
  });

  const showSettingsHubTabs = mode === "settings-hub";

  useEffect(() => {
    if (mode !== "legacy-tabs") return;
    setActiveTabState(readTabFromLocation());
  }, [mode]);

  const setActiveTab = (tab: OrgTab) => {
    setActiveTabState(tab);
    if (mode !== "legacy-tabs") return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url.toString());
  };
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { syncInvitationReceived } = useNotificationMutations();
  const { refreshOrganizations, orgs, setActiveOrganization } =
    useActiveOrganization();

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitationRow[]>(
    [],
  );
  const [editSnapshot, setEditSnapshot] = useState({ name: "", slug: "" });
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [orgMetadata, setOrgMetadata] = useState<
    string | Record<string, unknown> | null
  >(null);
  const [initialSlug, setInitialSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [slugError, setSlugError] = useState<string | undefined>();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("member");
  const [invitePending, setInvitePending] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [rolePendingId, setRolePendingId] = useState<string | null>(null);
  const [savePending, setSavePending] = useState(false);
  const [editOrgOpen, setEditOrgOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const editOrgCloseWithoutPromptRef = useRef<(() => void) | null>(null);
  const inviteCloseWithoutPromptRef = useRef<(() => void) | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deletePending, setDeletePending] = useState(false);
  const [leavePending, setLeavePending] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [roleConfirmOpen, setRoleConfirmOpen] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    memberId: string;
    role: string;
    email: string;
  } | null>(null);

  const currentUserId = session?.user?.id;
  const myMembership = members.find(
    (m) => m.user.id === currentUserId || m.user.email === session?.user?.email,
  );
  const isOwner = myMembership?.role === "owner";
  const isPersonal = isPersonalOrganization({ metadata: orgMetadata });
  const pendingInvitations = pendingOrganizationInvitations(invitations);

  const resetInviteFields = useCallback(() => {
    setInviteEmail("");
    setInviteRole("member");
  }, []);

  const inviteIsDirty = isInviteMemberFormDirty(inviteEmail, inviteRole);

  const loadOrganization = useCallback(async (targetOrgId: string) => {
    const org = await authClient.organization.getFullOrganization({
      query: { organizationId: targetOrgId },
    });
    if (!org.data || org.data.id !== targetOrgId) {
      throw new Error("Organization not found");
    }
    setOrgName(org.data.name);
    setOrgSlug(org.data.slug);
    setInitialSlug(org.data.slug);
    setOrgMetadata(org.data.metadata ?? null);
    const list = await authClient.organization.listMembers({
      query: { organizationId: targetOrgId },
    });
    setMembers((list.data?.members ?? []) as MemberRow[]);
    const embeddedInvites = parseOrganizationInvitations(
      (org.data as { invitations?: unknown }).invitations,
    );
    const inviteList = await authClient.organization.listInvitations({
      query: { organizationId: targetOrgId },
    });
    const listedInvites = parseOrganizationInvitations(inviteList.data);
    setInvitations(listedInvites.length > 0 ? listedInvites : embeddedInvites);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setSlugError(undefined);
    setDeleteOpen(false);
    setDeleteConfirmName("");

    void (async () => {
      try {
        await loadOrganization(organizationId);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [organizationId, loadOrganization]);

  const revokeInvitation = async (invitationId: string) => {
    setRevokingId(invitationId);
    try {
      await toast.promise(
        cancelOrganizationInvitation(authClient.organization, invitationId),
        {
          loading: "Revoking invitation…",
          success: "Invitation revoked",
          error: "Could not revoke invitation",
        },
      );
      await loadOrganization(organizationId);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Revoke is not available for this workspace."
      ) {
        toast.error(error.message);
      }
    } finally {
      setRevokingId(null);
    }
  };

  const resendInvitation = async (invite: OrganizationInvitationRow) => {
    setResendingId(invite.id);
    try {
      await toast.promise(
        resendOrganizationInvitation(authClient.organization, {
          organizationId,
          email: invite.email,
          role: invite.role,
        }),
        {
          loading: "Resending invitation…",
          success: "Invitation resent",
          error: "Could not resend invitation",
        },
      );
      await loadOrganization(organizationId);
      if (isNotificationsEnabledOnClient() && currentUserId) {
        void syncInvitationReceived.mutate({
          organizationId,
          email: invite.email,
        });
      }
    } finally {
      setResendingId(null);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    setInvitePending(true);
    try {
      await toast.promise(
        authClient.organization.inviteMember({
          email,
          role: inviteRole as OrgMemberRole,
          organizationId,
        }),
        {
          loading: "Sending invitation…",
          success: "Invitation sent",
          error: "Could not send invitation",
        },
      );
      resetInviteFields();
      inviteCloseWithoutPromptRef.current?.();
      setInviteOpen(false);
      await loadOrganization(organizationId);
      if (isNotificationsEnabledOnClient() && currentUserId) {
        void syncInvitationReceived.mutate({
          organizationId,
          email,
        });
      }
    } catch {
      // Toast handled by toast.promise
    } finally {
      setInvitePending(false);
    }
  };

  const requestRoleChange = (memberId: string, role: string, email: string) => {
    setPendingRoleChange({ memberId, role, email });
    setRoleConfirmOpen(true);
  };

  const handleRoleChange = async () => {
    if (!pendingRoleChange) return;
    const { memberId, role } = pendingRoleChange;
    setRolePendingId(memberId);
    try {
      await toast.promise(
        authClient.organization.updateMemberRole({
          memberId,
          role: role as OrgMemberRole,
          organizationId,
        }),
        {
          loading: "Updating role…",
          success: "Role updated",
          error: "Could not update role",
        },
      );
      setRoleConfirmOpen(false);
      setPendingRoleChange(null);
      await loadOrganization(organizationId);
    } catch {
      // Toast handled by toast.promise
    } finally {
      setRolePendingId(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlugError(undefined);
    setSavePending(true);
    try {
      const slugToSave = resolveOrgSlugForSave(orgSlug, initialSlug);
      await toast.promise(
        (async () => {
          const result = await authClient.organization.update({
            organizationId,
            data: {
              name: orgName.trim(),
              slug: slugToSave,
            },
          });
          if (result.error) {
            const message = formatOrganizationCreateError(result.error.message);
            if (message.toLowerCase().includes("slug")) {
              setSlugError(message);
            }
            throw new Error(message);
          }
        })(),
        {
          loading: "Saving organization…",
          success: "Organization updated",
          error: "Could not update organization",
        },
      );
      editOrgCloseWithoutPromptRef.current?.();
      setEditOrgOpen(false);
      await loadOrganization(organizationId);
      await refreshOrganizations();
    } catch {
      // Toast handled by toast.promise
    } finally {
      setSavePending(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmName !== orgName) return;
    const deletedId = organizationId;
    const deletedName = orgName;
    const fallback = orgs.find((o) => o.id !== deletedId);

    setDeleteOpen(false);
    setDeletePending(true);
    router.replace("/dashboard/organizations" as Route);
    void invalidateAfterOrganizationChange(queryClient);

    try {
      await toast.promise(
        (async () => {
          const result = await authClient.organization.delete({
            organizationId: deletedId,
          });
          if (result.error) {
            throw new Error(
              result.error.message ?? "Could not delete organization",
            );
          }
        })(),
        {
          loading: "Deleting organization…",
          success: `Deleted ${deletedName}`,
          error: "Could not delete organization",
        },
      );
      if (fallback) {
        await setActiveOrganization(fallback.id);
      } else {
        await refreshOrganizations();
      }
      router.refresh();
    } catch {
      // Toast handled by toast.promise
    } finally {
      setDeletePending(false);
    }
  };

  const handleLeave = async () => {
    setLeavePending(true);
    setLeaveConfirmOpen(false);
    const leftId = organizationId;
    const fallback = orgs.find((o) => o.id !== leftId);
    router.replace("/dashboard/organizations" as Route);
    void invalidateAfterOrganizationChange(queryClient);

    try {
      await toast.promise(
        (async () => {
          const result = await authClient.organization.leave({
            organizationId: leftId,
          });
          if (result.error) {
            throw new Error(
              result.error.message ?? "Could not leave organization",
            );
          }
        })(),
        {
          loading: "Leaving organization…",
          success: "You left the organization",
          error: "Could not leave organization",
        },
      );
      if (fallback) {
        await setActiveOrganization(fallback.id);
      } else {
        await refreshOrganizations();
      }
      router.refresh();
    } catch {
      // Toast handled by toast.promise
    } finally {
      setLeavePending(false);
    }
  };

  if (loading) {
    return <SettingsPanelSkeleton rows={3} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Organization settings unavailable"
        description="Select an organization or complete onboarding first."
        onRetry={() => void loadOrganization(organizationId)}
      />
    );
  }

  return (
    <>
      <SettingsTabs
        value={activeTab}
        onValueChange={(value) => {
          if (value) setActiveTab(value as OrgTab);
        }}
      >
        {mode === "legacy-tabs" || showSettingsHubTabs ? (
          <SettingsTabsList>
            <SettingsTabsTab value="general" icon="organization">
              General
            </SettingsTabsTab>
            {mode === "legacy-tabs" ? (
              <SettingsTabsTab value="members" icon="member">
                Members
              </SettingsTabsTab>
            ) : null}
            <SettingsTabsTab value="danger" icon="danger">
              Danger zone
            </SettingsTabsTab>
          </SettingsTabsList>
        ) : null}

        {(mode === "legacy-tabs" ||
          mode === "general" ||
          mode === "settings-hub") && (
          <SettingsTabsPanel value="general" className="min-w-0">
            <SettingsPanel>
              <SettingsSectionHeader
                title="Profile"
                description="Name and slug for this workspace."
                icon="organization"
              />
              <SettingsRow
                label="Name"
                description="Organization display name."
              >
                <span className="text-sm">{orgName}</span>
              </SettingsRow>
              <SettingsRow
                label="Slug"
                description="URL-safe workspace identifier."
              >
                <span className="font-mono text-sm">{orgSlug}</span>
              </SettingsRow>
              <SettingsRow
                label="Details"
                description="Update name, slug, and metadata."
              >
                <Button
                  type="button"
                  size="sm"
                  className="w-fit gap-2"
                  onClick={() => {
                    setEditSnapshot({ name: orgName, slug: orgSlug });
                    setEditOrgOpen(true);
                  }}
                >
                  <AppIcon name="edit" className="text-current" />
                  Edit organization
                </Button>
              </SettingsRow>
            </SettingsPanel>
          </SettingsTabsPanel>
        )}

        {(mode === "legacy-tabs" || mode === "members") && (
          <SettingsTabsPanel value="members" className="min-w-0 space-y-2">
            <SettingsPanel>
              <SettingsSectionHeader
                title="Members"
                description="Invite teammates and manage roles."
                icon="member"
              />
              <SettingsRow label="Invite" description="Add someone by email.">
                <Button
                  type="button"
                  size="sm"
                  className="w-fit gap-2"
                  onClick={() => setInviteOpen(true)}
                >
                  <AppIcon name="invite" className="text-current" />
                  Invite member
                </Button>
              </SettingsRow>
              {members.length <= 1 ? (
                <div className="px-4 py-6">
                  <Empty className="border border-dashed py-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <AppIcon name="member" className="size-5" />
                      </EmptyMedia>
                      <EmptyTitle>You're the only member</EmptyTitle>
                      <EmptyDescription>
                        {pendingInvitations.length > 0
                          ? `You have ${pendingInvitations.length} pending ${pendingInvitations.length === 1 ? "invitation" : "invitations"} awaiting acceptance.`
                          : "Invite teammates to share projects and environments."}
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button
                        type="button"
                        size="sm"
                        className="gap-2"
                        onClick={() => setInviteOpen(true)}
                      >
                        <AppIcon name="invite" className="text-current" />
                        Invite member
                      </Button>
                    </EmptyContent>
                  </Empty>
                </div>
              ) : (
                <div className="min-w-0 overflow-x-auto px-4 py-4">
                  <OrganizationMembersTable
                    members={members}
                    roleSelectItems={ROLE_SELECT_ITEMS}
                    isOwner={isOwner}
                    rolePendingId={rolePendingId}
                    onRoleChange={(memberId, role) => {
                      const member = members.find((m) => m.id === memberId);
                      requestRoleChange(
                        memberId,
                        role,
                        member?.user.email ?? "member",
                      );
                    }}
                    empty={membersTableEmpty(
                      <Button
                        type="button"
                        size="sm"
                        className="gap-2"
                        onClick={() => setInviteOpen(true)}
                      >
                        <AppIcon name="invite" className="text-current" />
                        Invite member
                      </Button>,
                    )}
                  />
                </div>
              )}
            </SettingsPanel>

            <SettingsPanel>
              <SettingsSectionHeader
                title="Invitations"
                description="Pending email invites."
                icon="mail"
              />
              <div className="px-4 py-4">
                {pendingInvitations.length === 0 ? (
                  <Empty className="border border-dashed py-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <AppIcon name="mail" className="size-5" />
                      </EmptyMedia>
                      <EmptyTitle>{invitationsEmpty().empty.title}</EmptyTitle>
                      <EmptyDescription>
                        {invitationsEmpty().empty.description}
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button
                        type="button"
                        size="sm"
                        className="gap-2"
                        onClick={() => setInviteOpen(true)}
                      >
                        <AppIcon name="invite" className="text-current" />
                        Invite member
                      </Button>
                    </EmptyContent>
                  </Empty>
                ) : (
                  <OrganizationInvitationsTable
                    invitations={pendingInvitations}
                    empty={invitationsEmpty(
                      <Button
                        type="button"
                        size="sm"
                        className="gap-2"
                        onClick={() => setInviteOpen(true)}
                      >
                        <AppIcon name="invite" className="text-current" />
                        Invite member
                      </Button>,
                    )}
                    revokingId={revokingId}
                    resendingId={resendingId}
                    onRevoke={(id) => void revokeInvitation(id)}
                    onResend={(invite) => void resendInvitation(invite)}
                  />
                )}
              </div>
            </SettingsPanel>
          </SettingsTabsPanel>
        )}

        {(mode === "legacy-tabs" ||
          mode === "danger" ||
          showSettingsHubTabs) && (
          <SettingsTabsPanel value="danger" className="min-w-0">
            <SettingsPanel className="border-destructive/32 bg-destructive/4">
              <SettingsSectionHeader
                title="Danger zone"
                description="Irreversible organization actions."
                icon="danger"
              />
              {isOwner ? (
                isPersonal ? (
                  <SettingsRow
                    label="Personal workspace"
                    description="Your personal workspace cannot be deleted."
                  >
                    <span className="text-muted-foreground text-xs">—</span>
                  </SettingsRow>
                ) : (
                  <SettingsRow
                    label="Delete organization"
                    description="Removes members and invitations. Projects must be removed or moved first."
                  >
                    <div className="flex flex-col items-end gap-1">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="w-fit"
                        disabled={orgs.length <= 1 || deletePending}
                        onClick={() => {
                          setDeleteConfirmName("");
                          setDeleteOpen(true);
                        }}
                      >
                        Delete organization
                      </Button>
                      {orgs.length <= 1 ? (
                        <p className="max-w-[14rem] text-end text-muted-foreground text-xs">
                          Create another organization before deleting this one.
                        </p>
                      ) : null}
                    </div>
                  </SettingsRow>
                )
              ) : (
                <SettingsRow
                  label="Leave organization"
                  description="You will lose access to its projects."
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    disabled={leavePending}
                    onClick={() => setLeaveConfirmOpen(true)}
                  >
                    {leavePending ? (
                      <>
                        <Spinner className="me-2" />
                        Leaving…
                      </>
                    ) : (
                      "Leave organization"
                    )}
                  </Button>
                </SettingsRow>
              )}
            </SettingsPanel>
          </SettingsTabsPanel>
        )}
      </SettingsTabs>

      <FormSheet
        open={editOrgOpen}
        onOpenChange={setEditOrgOpen}
        isDirty={
          editOrgOpen &&
          (orgName !== editSnapshot.name || orgSlug !== editSnapshot.slug)
        }
        onDiscard={() => {
          setOrgName(editSnapshot.name);
          setOrgSlug(editSnapshot.slug);
          setSlugError(undefined);
        }}
        closeWithoutPromptRef={editOrgCloseWithoutPromptRef}
      >
        <FormSheetPopup>
          <FormSheetHeader>
            <SheetTitleWithIcon icon="organization">
              Edit organization
            </SheetTitleWithIcon>
            <SheetDescription>
              Update the name and URL slug for this workspace.
            </SheetDescription>
          </FormSheetHeader>
          <FormSheetForm onSubmit={handleSaveProfile}>
            <FormSheetBody>
              <FormField id="org-name-edit" label="Name" required>
                <Input
                  id="org-name-edit"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </FormField>
              <FormField
                id="org-slug-edit"
                label="Slug"
                required
                hint="Slugs use lowercase letters, numbers, and hyphens."
                error={slugError}
              >
                <OrgSlugInput
                  id="org-slug-edit"
                  value={orgSlug}
                  onChange={(value) => {
                    setSlugError(undefined);
                    setOrgSlug(value);
                  }}
                />
              </FormField>
            </FormSheetBody>
            <FormSheetFooter>
              <SheetClose
                render={
                  <Button
                    variant="ghost"
                    type="button"
                    disabled={savePending}
                  />
                }
              >
                Cancel
              </SheetClose>
              <SubmitButton isLoading={savePending} loadingLabel="Saving…">
                Save changes
              </SubmitButton>
            </FormSheetFooter>
          </FormSheetForm>
        </FormSheetPopup>
      </FormSheet>

      <FormSheet
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        isDirty={inviteIsDirty}
        onDiscard={resetInviteFields}
        closeWithoutPromptRef={inviteCloseWithoutPromptRef}
      >
        <FormSheetPopup>
          <FormSheetHeader>
            <SheetTitleWithIcon icon="invite">Invite member</SheetTitleWithIcon>
            <SheetDescription>
              Send an email invitation with a role for this organization.
            </SheetDescription>
          </FormSheetHeader>
          <FormSheetForm onSubmit={handleInvite}>
            <FormSheetBody>
              <FormField id="invite-email" label="Email" required>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  autoComplete="email"
                />
              </FormField>
              <FormField id="invite-role" label="Role">
                <Select
                  value={inviteRole}
                  items={ROLE_SELECT_ITEMS}
                  onValueChange={(value) => {
                    if (value) setInviteRole(value);
                  }}
                >
                  <SelectTrigger id="invite-role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem
                        key={role}
                        value={role}
                        className="capitalize"
                      >
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </FormSheetBody>
            <FormSheetFooter>
              <SheetClose
                render={
                  <Button
                    variant="ghost"
                    type="button"
                    disabled={invitePending}
                  />
                }
              >
                Cancel
              </SheetClose>
              <SubmitButton
                isLoading={invitePending}
                loadingLabel="Sending…"
                disabled={!inviteEmail.trim()}
              >
                Send invitation
              </SubmitButton>
            </FormSheetFooter>
          </FormSheetForm>
        </FormSheetPopup>
      </FormSheet>

      <ConfirmDialog
        open={leaveConfirmOpen}
        onOpenChange={setLeaveConfirmOpen}
        title="Leave organization"
        description={`Leave ${orgName}? You will lose access to its projects and environments.`}
        confirmLabel="Leave organization"
        variant="destructive"
        onConfirm={handleLeave}
        isPending={leavePending}
      />

      <ConfirmDialog
        open={roleConfirmOpen}
        onOpenChange={(open) => {
          setRoleConfirmOpen(open);
          if (!open) setPendingRoleChange(null);
        }}
        title="Change member role"
        description={
          pendingRoleChange
            ? `Change role for ${pendingRoleChange.email} to ${pendingRoleChange.role}?`
            : "Confirm role change."
        }
        confirmLabel="Update role"
        onConfirm={handleRoleChange}
        isPending={rolePendingId !== null}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete organization</AlertDialogTitle>
            <AlertDialogDescription>
              Type <strong>{orgName}</strong> to confirm deleting organization{" "}
              <strong>{orgSlug}</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteConfirmName}
            onChange={(e) => setDeleteConfirmName(e.target.value)}
            placeholder={orgName}
            aria-label="Confirm organization name"
          />
          <AlertDialogFooter>
            <AlertDialogClose
              render={<Button variant="ghost" disabled={deletePending} />}
            >
              Cancel
            </AlertDialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={deletePending || deleteConfirmName !== orgName}
              onClick={() => void handleDelete()}
            >
              {deletePending ? (
                <>
                  <Spinner className="me-2" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  );
}
