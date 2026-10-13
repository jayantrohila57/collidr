"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { OrgSlugInput } from "@/components/org/org-slug-input";
import { OrganizationMembersTable } from "@/components/org/organization-members-table";
import { ErrorState } from "@/components/patterns/error-state";
import { FormField } from "@/components/patterns/form-field";
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
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { authClient } from "@/lib/auth-client";
import { invalidateAfterOrganizationChange } from "@/lib/invalidate-org-queries";
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

export function OrganizationSettingsForm({
  organizationId,
}: {
  organizationId: string;
}) {
  const router = useRouter();
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
      <div className="flex flex-col gap-6" aria-busy="true">
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
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
          <CardDescription>Name and slug for this workspace.</CardDescription>
        </CardHeader>
        <CardPanel>
          <form onSubmit={handleSaveProfile} className="space-y-4">
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
            <SubmitButton isLoading={savePending} loadingLabel="Saving…">
              Save changes
            </SubmitButton>
          </form>
        </CardPanel>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invite member</CardTitle>
        </CardHeader>
        <CardPanel>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
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
                  <SelectTrigger id="invite-role" className="w-full sm:w-32">
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
              <SubmitButton
                isLoading={invitePending}
                loadingLabel="Sending…"
                disabled={!inviteEmail.trim()}
              >
                Invite
              </SubmitButton>
            </div>
          </form>
        </CardPanel>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardPanel>
          <OrganizationMembersTable
            members={members}
            roleSelectItems={ROLE_SELECT_ITEMS}
            isOwner={isOwner}
            rolePendingId={rolePendingId}
            onRoleChange={(memberId, role) => {
              void handleRoleChange(memberId, role);
            }}
          />
        </CardPanel>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>Irreversible organization actions.</CardDescription>
        </CardHeader>
        <CardPanel>
          {isOwner ? (
            <>
              <p className="text-muted-foreground text-sm">
                {isPersonal
                  ? "Your personal workspace cannot be deleted."
                  : "Deleting an organization removes members and invitations. Projects must be removed or moved first."}
              </p>
              <Button
                type="button"
                variant="destructive"
                disabled={isPersonal || orgs.length <= 1 || deletePending}
                onClick={() => {
                  setDeleteConfirmName("");
                  setDeleteOpen(true);
                }}
              >
                Delete organization
              </Button>
              {orgs.length <= 1 && !isPersonal && (
                <p className="text-muted-foreground text-xs">
                  Create another organization before deleting this one.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-sm">
                Leave this organization. You will lose access to its projects.
              </p>
              <Button
                type="button"
                variant="outline"
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
            </>
          )}
        </CardPanel>
      </Card>

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
    </div>
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
