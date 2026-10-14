"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { auditLogEmpty } from "@/components/data-table/data-table-empty-presets";
import { AppIcon } from "@/components/patterns/app-icon";
import { ErrorState } from "@/components/patterns/error-state";
import {
  SettingsField,
  SettingsPanel,
  SettingsRow,
  SettingsSectionHeader,
  settingsControlWidthClass,
} from "@/components/patterns/settings-layout";
import {
  SettingsTabs,
  SettingsTabsList,
  SettingsTabsPanel,
  SettingsTabsTab,
} from "@/components/patterns/settings-tabs";
import { SubmitButton } from "@/components/patterns/submit-button";
import { UnsavedChangesPageGuard } from "@/components/patterns/unsaved-changes-page-guard";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { AuditLogTableView } from "@/domain/audit/components/audit-log-table-view";
import {
  linkGithubAccount,
  listAuthSessions,
  performSignOut,
  revokeAuthSession,
  revokeOtherAuthSessions,
  unlinkProviderAccount,
  updateProfile,
  useSession,
} from "@/domain/auth/lib/auth-actions";
import { PermissionGate } from "@/domain/permissions/components/permission-gate";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { accountSettingsActions } from "@/domain/permissions/org-section-actions";
import { TimelinePageClient } from "@/domain/timeline/components/timeline-page-client";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import { formatDate } from "@/lib/format";
import { formatRelativeShort } from "@/lib/format-relative-short";
import { initialsFromLabel } from "@/lib/initials";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { sessionDeviceLabel } from "@/lib/session-device";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";
import { AccountSettingsSkeleton } from "./account-settings-skeleton";

const ACCOUNT_TABS = [
  "profile",
  "sessions",
  "accounts",
  "export",
  "delete",
  "timeline",
] as const;

type AccountTab = (typeof ACCOUNT_TABS)[number];

function readTabFromSearch(param: string | null): AccountTab {
  return ACCOUNT_TABS.includes(param as AccountTab)
    ? (param as AccountTab)
    : "profile";
}

type AuthSessionRow = {
  id?: string;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  updatedAt?: Date | string;
  createdAt?: Date | string;
};

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AccountSettingsClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { data: session, isPending, error, refetch } = useSession();
  const user = session?.user;
  const sessionToken = session?.session?.token;

  const [activeTab, setActiveTabState] = useState<AccountTab>("profile");
  const tabFromUrl = searchParams.get("tab");

  useEffect(() => {
    setActiveTabState(readTabFromSearch(tabFromUrl));
  }, [tabFromUrl]);

  const setActiveTab = useCallback((tab: AccountTab) => {
    setActiveTabState(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url.toString());
  }, []);

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileDirty, setProfileDirty] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setAvatarUrl(user.image ?? "");
    setProfileDirty(false);
  }, [user]);

  const connectedQuery = useQuery(
    trpc.account.listConnectedAccounts.queryOptions(),
  );
  const deleteBlockersQuery = useQuery(
    trpc.account.getDeleteBlockers.queryOptions(),
  );
  const exportMutation = useMutation(trpc.account.exportData.mutationOptions());

  const [sessions, setSessions] = useState<AuthSessionRow[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [revokeToken, setRevokeToken] = useState<string | null>(null);
  const [revokeOthersOpen, setRevokeOthersOpen] = useState(false);
  const [revokePending, setRevokePending] = useState(false);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const rows = await listAuthSessions();
      setSessions(rows as AuthSessionRow[]);
    } catch (err) {
      setSessionsError(
        err instanceof Error ? err.message : "Could not load sessions",
      );
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "sessions") {
      void loadSessions();
    }
  }, [activeTab, loadSessions]);

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const softDeleteMutation = useMutation(
    trpc.account.softDelete.mutationOptions({
      onSuccess: async () => {
        toast.success("Account deleted");
        void performSignOut({ queryClient, router });
      },
      onError: (err) => {
        toast.error(err.message ?? "Could not delete account");
      },
    }),
  );

  const profileSaveMutation = useMutation({
    mutationFn: async () => {
      await updateProfile({
        name: name.trim(),
        image: avatarUrl.trim() || undefined,
      });
    },
    onSuccess: async () => {
      toast.success("Profile updated");
      setProfileDirty(false);
      await refetch();
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Could not update profile");
    },
  });

  const timelineQuery = useQuery(
    trpc.auditLogs.list.queryOptions({
      limit: 50,
      offset: 0,
    }),
  );
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const canProfile = useCan(accountSettingsActions.profile);
  const canSessions = useCan(accountSettingsActions.sessions);
  const canAccounts = useCan(accountSettingsActions.accounts);
  const canExport = useCan(accountSettingsActions.export);
  const canDelete = useCan(accountSettingsActions.delete);
  const canTimeline = useCan(accountSettingsActions.timeline);

  const deletePhrase = user?.email ?? "";
  const canDeleteAccount = deleteBlockersQuery.data?.data.canDelete ?? false;
  const soleOwnerOrgs =
    deleteBlockersQuery.data?.data.soleOwnerOrganizations ?? [];

  const connectedAccounts = connectedQuery.data?.data ?? [];
  const githubAccount = connectedAccounts.find(
    (a) => a.providerId === "github",
  );
  const canUnlinkGithub = connectedAccounts.length > 1;

  const orgLinkEnabled = isOrganizationsEnabledOnClient();

  if (isPending) {
    return <AccountSettingsSkeleton />;
  }

  if (error || !user) {
    return (
      <ErrorState
        title="Could not load account"
        description="Sign in again to manage your settings."
        onRetry={() => refetch()}
      />
    );
  }

  const handleExportDownload = async () => {
    try {
      const payload = await exportMutation.mutateAsync();
      const stamp = new Date().toISOString().slice(0, 10);
      downloadJson(`loftlancer-export-${stamp}.json`, payload);
      toast.success("Export downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not export data");
    }
  };

  const handleRevokeSession = async (token: string) => {
    setRevokePending(true);
    try {
      await revokeAuthSession(token);
      toast.success("Session revoked");
      setRevokeToken(null);
      await loadSessions();
      if (token === sessionToken) {
        void performSignOut({ queryClient, router });
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not revoke session",
      );
    } finally {
      setRevokePending(false);
    }
  };

  const handleRevokeOthers = async () => {
    setRevokePending(true);
    try {
      await revokeOtherAuthSessions();
      toast.success("Other sessions revoked");
      setRevokeOthersOpen(false);
      await loadSessions();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not revoke sessions",
      );
    } finally {
      setRevokePending(false);
    }
  };

  const handleLinkGithub = async () => {
    try {
      await linkGithubAccount();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not link GitHub");
    }
  };

  const handleUnlinkGithub = async (accountId: string) => {
    try {
      await unlinkProviderAccount(accountId);
      toast.success("GitHub unlinked");
      await connectedQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not unlink");
    }
  };

  const timelineLogs = timelineQuery.data?.data ?? [];
  const timelineStatus = timelineQuery.isLoading
    ? "loading"
    : timelineQuery.isError
      ? "error"
      : timelineLogs.length === 0
        ? "empty"
        : "success";

  const resetProfileFields = () => {
    setName(user.name ?? "");
    setAvatarUrl(user.image ?? "");
    setProfileDirty(false);
  };

  return (
    <UnsavedChangesPageGuard
      isDirty={profileDirty}
      onDiscard={resetProfileFields}
    >
      {({ guardNavigation }) => (
        <>
          <SettingsTabs
            value={activeTab}
            onValueChange={(value) => {
              if (!value || value === activeTab) return;
              guardNavigation(() => setActiveTab(value as AccountTab));
            }}
          >
            <SettingsTabsList>
              {canProfile.allowed ? (
                <SettingsTabsTab value="profile" icon="user">
                  Profile
                </SettingsTabsTab>
              ) : null}
              {canSessions.allowed ? (
                <SettingsTabsTab value="sessions" icon="lock">
                  Sessions
                </SettingsTabsTab>
              ) : null}
              {canAccounts.allowed ? (
                <SettingsTabsTab value="accounts" icon="github">
                  Connected accounts
                </SettingsTabsTab>
              ) : null}
              {canExport.allowed ? (
                <SettingsTabsTab value="export" icon="archiveRestore">
                  Export
                </SettingsTabsTab>
              ) : null}
              {canDelete.allowed ? (
                <SettingsTabsTab value="delete" icon="danger">
                  Delete account
                </SettingsTabsTab>
              ) : null}
              {canTimeline.allowed ? (
                <SettingsTabsTab value="timeline" icon="activity">
                  Timeline
                </SettingsTabsTab>
              ) : null}
            </SettingsTabsList>

            <SettingsTabsPanel value="profile" className="min-w-0">
              <SettingsPanel>
                <SettingsSectionHeader
                  title="Profile"
                  description="Your name and avatar shown across the app."
                  icon="user"
                />
                <SettingsField label="Avatar" description="Image URL (HTTPS).">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Avatar className="size-12 shrink-0">
                      <AvatarImage src={avatarUrl || undefined} alt="" />
                      <AvatarFallback>
                        {initialsFromLabel(name || user.email, "US")}
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      value={avatarUrl}
                      onChange={(e) => {
                        setAvatarUrl(e.target.value);
                        setProfileDirty(true);
                      }}
                      placeholder="https://…"
                      className={settingsControlWidthClass}
                    />
                  </div>
                </SettingsField>
                <SettingsField
                  label="Display name"
                  description="Shown in the UI."
                >
                  <Input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setProfileDirty(true);
                    }}
                    className={settingsControlWidthClass}
                  />
                </SettingsField>
                <SettingsRow
                  label="Email"
                  description="Sign-in email (read-only)."
                >
                  <span className="text-sm">{user.email}</span>
                </SettingsRow>
                <SettingsRow label="Save" description="Apply profile changes.">
                  <SubmitButton
                    type="button"
                    size="sm"
                    className="w-fit"
                    isLoading={profileSaveMutation.isPending}
                    loadingLabel="Saving…"
                    disabled={!profileDirty || !name.trim()}
                    onClick={() => profileSaveMutation.mutate()}
                  >
                    Save profile
                  </SubmitButton>
                </SettingsRow>
              </SettingsPanel>

              {orgLinkEnabled ? (
                <SettingsPanel className="mt-2">
                  <SettingsSectionHeader
                    title="Organization"
                    description="Workspace members and profile."
                    icon="organization"
                  />
                  <SettingsRow
                    label="Workspace"
                    description="Managed in the Organizations module."
                  >
                    <Button
                      type="button"
                      size="sm"
                      className="w-fit gap-2"
                      render={
                        <Link
                          href={"/dashboard/settings/organization" as Route}
                        />
                      }
                    >
                      <AppIcon name="settings" className="text-current" />
                      Organization settings
                    </Button>
                  </SettingsRow>
                </SettingsPanel>
              ) : null}

              <SettingsPanel className="mt-2">
                <SettingsSectionHeader
                  title="Production deploy"
                  description="Feature flags, redeploy rules, and Vercel limits."
                  icon="globe"
                />
                <SettingsRow
                  label="Deploy runbook"
                  description="Check server vs client flags for this build."
                >
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-fit gap-2"
                    render={
                      <Link href={"/dashboard/settings/deploy" as Route} />
                    }
                  >
                    <AppIcon name="externalLink" className="text-current" />
                    Open runbook
                  </Button>
                </SettingsRow>
              </SettingsPanel>
            </SettingsTabsPanel>

            <SettingsTabsPanel value="sessions" className="min-w-0">
              <PermissionGate action={accountSettingsActions.sessions}>
                <SettingsPanel>
                  <SettingsSectionHeader
                    title="Sessions"
                    description="Devices signed in to your account."
                    icon="lock"
                  />
                  <SettingsRow
                    label="Revoke others"
                    description="Sign out every device except this one."
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-fit"
                      disabled={sessions.length <= 1 || sessionsLoading}
                      onClick={() => setRevokeOthersOpen(true)}
                    >
                      Revoke all other sessions
                    </Button>
                  </SettingsRow>
                  {sessionsLoading ? (
                    <div className="space-y-3 px-4 py-4">
                      <Skeleton className="h-14 w-full" />
                      <Skeleton className="h-14 w-full" />
                    </div>
                  ) : sessionsError ? (
                    <div className="px-4 py-4">
                      <ErrorState
                        title="Could not load sessions"
                        description={sessionsError}
                        onRetry={() => void loadSessions()}
                      />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="px-4 py-6">
                      <Empty className="border border-dashed py-8">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <AppIcon name="lock" className="size-5" />
                          </EmptyMedia>
                          <EmptyTitle>No active sessions</EmptyTitle>
                          <EmptyDescription>
                            Sign in again to refresh this list.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {sessions.map((row) => {
                        const isCurrent = row.token === sessionToken;
                        const lastActive = row.updatedAt ?? row.createdAt;
                        return (
                          <li
                            key={row.token}
                            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-sm">
                                  {sessionDeviceLabel(row.userAgent ?? null)}
                                </p>
                                {isCurrent ? (
                                  <Badge variant="secondary">This device</Badge>
                                ) : null}
                              </div>
                              <p className="text-muted-foreground text-xs">
                                {row.ipAddress
                                  ? `IP ${row.ipAddress}`
                                  : "IP unknown"}
                                {lastActive
                                  ? ` · Last active ${formatRelativeShort(String(lastActive))}`
                                  : null}
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="w-fit shrink-0"
                              disabled={revokePending}
                              onClick={() => setRevokeToken(row.token)}
                            >
                              Revoke
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </SettingsPanel>
              </PermissionGate>
            </SettingsTabsPanel>

            <SettingsTabsPanel value="accounts" className="min-w-0">
              <PermissionGate action={accountSettingsActions.accounts}>
                <SettingsPanel>
                  <SettingsSectionHeader
                    title="Connected accounts"
                    description="OAuth providers linked to your login."
                    icon="github"
                  />
                  {connectedQuery.isLoading ? (
                    <div className="space-y-3 px-4 py-4">
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : connectedQuery.isError ? (
                    <div className="px-4 py-4">
                      <ErrorState
                        title="Could not load accounts"
                        description={connectedQuery.error.message}
                        onRetry={() => void connectedQuery.refetch()}
                      />
                    </div>
                  ) : connectedAccounts.length === 0 ? (
                    <div className="px-4 py-6">
                      <Empty className="border border-dashed py-8">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <AppIcon name="github" className="size-5" />
                          </EmptyMedia>
                          <EmptyTitle>No connected accounts</EmptyTitle>
                          <EmptyDescription>
                            Link GitHub to sign in with OAuth.
                          </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                          <Button
                            type="button"
                            size="sm"
                            className="gap-2"
                            onClick={() => void handleLinkGithub()}
                          >
                            <AppIcon name="github" className="text-current" />
                            Link GitHub
                          </Button>
                        </EmptyContent>
                      </Empty>
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {connectedAccounts.map((row) => (
                        <li
                          key={row.id}
                          className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <AppIcon name="github" />
                              <p className="font-medium text-sm capitalize">
                                {row.providerId}
                              </p>
                            </div>
                            <p className="font-mono text-muted-foreground text-xs">
                              ID {row.accountId}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Scopes: {row.scope?.trim() ? row.scope : "—"}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Linked {formatDate(row.createdAt)}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                            {row.providerId === "github" ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="w-fit"
                                disabled={!canUnlinkGithub}
                                onClick={() =>
                                  void handleUnlinkGithub(row.accountId)
                                }
                              >
                                Unlink
                              </Button>
                            ) : null}
                            {!canUnlinkGithub ? (
                              <p className="max-w-[14rem] text-muted-foreground text-xs">
                                Add another sign-in method before unlinking your
                                only provider.
                              </p>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!githubAccount && connectedAccounts.length > 0 ? (
                    <SettingsRow
                      label="Link GitHub"
                      description="Add GitHub as a sign-in method."
                    >
                      <Button
                        type="button"
                        size="sm"
                        className="w-fit gap-2"
                        onClick={() => void handleLinkGithub()}
                      >
                        <AppIcon name="github" className="text-current" />
                        Link GitHub
                      </Button>
                    </SettingsRow>
                  ) : null}
                </SettingsPanel>
              </PermissionGate>
            </SettingsTabsPanel>

            <SettingsTabsPanel value="export" className="min-w-0">
              <PermissionGate action={accountSettingsActions.export}>
                <SettingsPanel>
                  <SettingsSectionHeader
                    title="Export my data"
                    description="Download a JSON copy of data you own."
                    icon="archiveRestore"
                  />
                  <SettingsRow
                    label="Download"
                    description="Includes projects, environments, variable keys, audit log, and profile metadata. Secret values are excluded."
                  >
                    <SubmitButton
                      type="button"
                      size="sm"
                      className="w-fit gap-2"
                      isLoading={exportMutation.isPending}
                      loadingLabel="Preparing…"
                      onClick={() => void handleExportDownload()}
                    >
                      <AppIcon name="archiveRestore" className="text-current" />
                      Download JSON
                    </SubmitButton>
                  </SettingsRow>
                </SettingsPanel>
              </PermissionGate>
            </SettingsTabsPanel>

            <SettingsTabsPanel value="delete" className="min-w-0">
              <PermissionGate action={accountSettingsActions.delete}>
                <SettingsPanel className="border-destructive/32 bg-destructive/4">
                  <SettingsSectionHeader
                    title="Delete account"
                    description="Soft-deletes your user and signs you out."
                    icon="danger"
                  />
                  {!canDeleteAccount && soleOwnerOrgs.length > 0 ? (
                    <SettingsRow
                      label="Ownership"
                      description="Transfer ownership before deleting."
                    >
                      <ul className="max-w-md space-y-1 text-end text-muted-foreground text-xs">
                        {soleOwnerOrgs.map((org) => (
                          <li key={org.organizationId}>
                            Sole owner of <strong>{org.name}</strong> (
                            {org.slug})
                          </li>
                        ))}
                      </ul>
                    </SettingsRow>
                  ) : null}
                  <SettingsRow
                    label="Delete"
                    description="Type your email to confirm. This cannot be undone."
                  >
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="w-fit"
                      disabled={
                        !canDeleteAccount || softDeleteMutation.isPending
                      }
                      onClick={() => {
                        setDeleteConfirm("");
                        setDeleteOpen(true);
                      }}
                    >
                      Delete account
                    </Button>
                  </SettingsRow>
                </SettingsPanel>
              </PermissionGate>
            </SettingsTabsPanel>

            <SettingsTabsPanel value="timeline" className="min-w-0">
              <PermissionGate action={accountSettingsActions.timeline}>
                <SettingsPanel>
                  <SettingsSectionHeader
                    title="Timeline"
                    description="Your personal audit history."
                    icon="activity"
                  />
                  <div className="min-w-0 px-4 py-4">
                    {isActionsAuditEnabledOnClient() ? (
                      <TimelinePageClient scope="self" />
                    ) : timelineStatus === "error" ? (
                      <ErrorState
                        title="Could not load timeline"
                        description={
                          timelineQuery.error?.message ??
                          "The audit API may not be available yet."
                        }
                        onRetry={() => void timelineQuery.refetch()}
                      />
                    ) : (
                      <AuditLogTableView
                        logs={timelineLogs}
                        isLoading={timelineStatus === "loading"}
                        revealedIds={revealedIds}
                        onToggleReveal={(id) => {
                          setRevealedIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(id)) next.delete(id);
                            else next.add(id);
                            return next;
                          });
                        }}
                        searchValue=""
                        onSearchChange={() => {}}
                        empty={auditLogEmpty()}
                      />
                    )}
                  </div>
                </SettingsPanel>
              </PermissionGate>
            </SettingsTabsPanel>
          </SettingsTabs>

          <AlertDialog
            open={revokeToken !== null}
            onOpenChange={(open) => {
              if (!open) setRevokeToken(null);
            }}
          >
            <AlertDialogPopup>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke session</AlertDialogTitle>
                <AlertDialogDescription>
                  This device will be signed out immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogClose
                  render={<Button variant="ghost" disabled={revokePending} />}
                >
                  Cancel
                </AlertDialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={revokePending || !revokeToken}
                  onClick={() => {
                    if (revokeToken) void handleRevokeSession(revokeToken);
                  }}
                >
                  {revokePending ? (
                    <>
                      <Spinner className="me-2" />
                      Revoking…
                    </>
                  ) : (
                    "Revoke"
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogPopup>
          </AlertDialog>

          <AlertDialog
            open={revokeOthersOpen}
            onOpenChange={setRevokeOthersOpen}
          >
            <AlertDialogPopup>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke other sessions</AlertDialogTitle>
                <AlertDialogDescription>
                  Every device except this browser will be signed out.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogClose
                  render={<Button variant="ghost" disabled={revokePending} />}
                >
                  Cancel
                </AlertDialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={revokePending}
                  onClick={() => void handleRevokeOthers()}
                >
                  {revokePending ? (
                    <>
                      <Spinner className="me-2" />
                      Revoking…
                    </>
                  ) : (
                    "Revoke all others"
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogPopup>
          </AlertDialog>

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogPopup>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete account</AlertDialogTitle>
                <AlertDialogDescription>
                  Type <strong>{deletePhrase}</strong> to confirm. Your profile
                  will be anonymized and all sessions revoked.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={deletePhrase}
                aria-label="Confirm email"
                autoComplete="off"
              />
              <AlertDialogFooter>
                <AlertDialogClose
                  render={
                    <Button
                      variant="ghost"
                      disabled={softDeleteMutation.isPending}
                    />
                  }
                >
                  Cancel
                </AlertDialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={
                    softDeleteMutation.isPending ||
                    deleteConfirm !== deletePhrase
                  }
                  onClick={() => softDeleteMutation.mutate()}
                >
                  {softDeleteMutation.isPending ? (
                    <>
                      <Spinner className="me-2" />
                      Deleting…
                    </>
                  ) : (
                    "Delete account"
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogPopup>
          </AlertDialog>
        </>
      )}
    </UnsavedChangesPageGuard>
  );
}
