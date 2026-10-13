"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  invitationsEmpty,
  membersTableEmpty,
} from "@/components/data-table/data-table-empty-presets";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { OrgSlugInput } from "@/components/org/org-slug-input";
import { OrganizationMembersTable } from "@/components/org/organization-members-table";
import { AppIcon } from "@/components/patterns/app-icon";
import { ErrorState } from "@/components/patterns/error-state";
import { FormField } from "@/components/patterns/form-field";
import {
  SettingsPanel,
  SettingsRow,
  SettingsSectionHeader,
} from "@/components/patterns/settings-layout";
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
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { authClient } from "@/lib/auth-client";
import { invalidateAfterOrganizationChange } from "@/lib/invalidate-org-queries";
import { layoutSheetPanelClass } from "@/lib/layout-spacing";
import { isPersonalOrganization } from "@/lib/org-personal";
import {
  formatOrganizationCreateError,
  resolveOrgSlugForSave,
} from "@/lib/org-slug";
import { toast } from "@/lib/toast";

type MemberRow = {
  id: string;
  role: string;
  user: { name: string; email: string; id?: string };
};

const ROLES = ["member", "admin", "owner"] as const;

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

export function OrganizationSettingsForm({
  organizationId,
}: {
  organizationId: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTabState] = useState<OrgTab>("general");

  useEffect(() => {
    setActiveTabState(readTabFromLocation());
  }, []);

  const setActiveTab = (tab: OrgTab) => {
    setActiveTabState(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url.toString());
  };
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { refreshOrganizations, orgs, setActiveOrganization } =
    useActiveOrganization();

  const [members, setMembers] = useState<MemberRow[]>([]);
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
  const [rolePendingId, setRolePendingId] = useState<string | null>(null);
  const [savePending, setSavePending] = useState(false);
  const [editOrgOpen, setEditOrgOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deletePending, setDeletePending] = useState(false);
  const [leavePending, setLeavePending] = useState(false);

  const currentUserId = session?.user?.id;
  const myMembership = members.find(
    (m) => m.user.id === currentUserId || m.user.email === session?.user?.email,
  );
  const isOwner = myMembership?.role === "owner";
  const isPersonal = isPersonalOrganization({ metadata: orgMetadata });

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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    setInvitePending(true);
    try {
      await authClient.organization.inviteMember({
        email,
        role: inviteRole as "member" | "admin" | "owner",
        organizationId,
      });
      toast.success("Invitation sent");
      setInviteEmail("");
      setInviteOpen(false);
      await loadOrganization(organizationId);
    } catch {
      toast.error("Could not send invitation");
    } finally {
      setInvitePending(false);
    }
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    setRolePendingId(memberId);
    try {
      await authClient.organization.updateMemberRole({
        memberId,
        role: role as "member" | "admin" | "owner",
        organizationId,
      });
      toast.success("Role updated");
      await loadOrganization(organizationId);
    } catch {
      toast.error("Could not update role");
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
        toast.error(message);
        return;
      }
      toast.success("Organization updated");
      setEditOrgOpen(false);
      await loadOrganization(organizationId);
      await refreshOrganizations();
    } catch {
      toast.error("Could not update organization");
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
    router.replace("/dashboard" as Route);
    void invalidateAfterOrganizationChange(queryClient);

    try {
      const result = await authClient.organization.delete({
        organizationId: deletedId,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Could not delete organization");
        return;
      }
      toast.success(`Deleted ${deletedName}`);
      if (fallback) {
        await setActiveOrganization(fallback.id);
      } else {
        await refreshOrganizations();
      }
      router.refresh();
    } catch {
      toast.error("Could not delete organization");
    } finally {
      setDeletePending(false);
    }
  };

  const handleLeave = async () => {
    setLeavePending(true);
    const leftId = organizationId;
    const fallback = orgs.find((o) => o.id !== leftId);
    router.replace("/dashboard" as Route);
    void invalidateAfterOrganizationChange(queryClient);

    try {
      const result = await authClient.organization.leave({
        organizationId: leftId,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Could not leave organization");
        return;
      }
      toast.success("You left the organization");
      if (fallback) {
        await setActiveOrganization(fallback.id);
      } else {
        await refreshOrganizations();
      }
      router.refresh();
    } catch {
      toast.error("Could not leave organization");
    } finally {
      setLeavePending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
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
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (value) setActiveTab(value as OrgTab);
        }}
        className="min-w-0 gap-2"
      >
        <TabsList size="sm" className="h-auto w-fit max-w-full justify-start">
          <TabsTab value="general">General</TabsTab>
          <TabsTab value="members">Members</TabsTab>
          <TabsTab value="danger">Danger zone</TabsTab>
        </TabsList>

        <TabsPanel value="general" className="min-w-0">
          <SettingsPanel>
            <SettingsSectionHeader
              title="Profile"
              description="Name and slug for this workspace."
              icon="organization"
            />
            <SettingsRow label="Name" description="Organization display name.">
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
                onClick={() => setEditOrgOpen(true)}
              >
                <AppIcon name="edit" className="text-current" />
                Edit organization
              </Button>
            </SettingsRow>
          </SettingsPanel>
        </TabsPanel>

        <TabsPanel value="members" className="min-w-0 space-y-2">
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
                      Invite teammates to share projects and environments.
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
                    void handleRoleChange(memberId, role);
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
            <div className="px-4 py-6">
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
            </div>
          </SettingsPanel>
        </TabsPanel>

        <TabsPanel value="danger" className="min-w-0">
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
                  onClick={() => void handleLeave()}
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
        </TabsPanel>
      </Tabs>

      <Sheet open={editOrgOpen} onOpenChange={setEditOrgOpen}>
        <SheetPopup variant="inset">
          <SheetHeader>
            <SheetTitleWithIcon icon="organization">
              Edit organization
            </SheetTitleWithIcon>
            <SheetDescription>
              Update the name and URL slug for this workspace.
            </SheetDescription>
          </SheetHeader>
          <form className="contents" onSubmit={handleSaveProfile}>
            <SheetPanel className={layoutSheetPanelClass}>
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
            </SheetPanel>
            <SheetFooter>
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
            </SheetFooter>
          </form>
        </SheetPopup>
      </Sheet>

      <Sheet open={inviteOpen} onOpenChange={setInviteOpen}>
        <SheetPopup variant="inset">
          <SheetHeader>
            <SheetTitleWithIcon icon="invite">Invite member</SheetTitleWithIcon>
            <SheetDescription>
              Send an email invitation with a role for this organization.
            </SheetDescription>
          </SheetHeader>
          <form className="contents" onSubmit={handleInvite}>
            <SheetPanel className={layoutSheetPanelClass}>
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
            </SheetPanel>
            <SheetFooter>
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
            </SheetFooter>
          </form>
        </SheetPopup>
      </Sheet>

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

export default function OrganizationSettingsClient() {
  const { activeOrganizationId } = useActiveOrganization();
  if (!activeOrganizationId) return null;
  return (
    <OrganizationSettingsForm
      key={activeOrganizationId}
      organizationId={activeOrganizationId}
    />
  );
}
