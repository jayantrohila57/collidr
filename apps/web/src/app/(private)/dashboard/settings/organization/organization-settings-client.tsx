"use client";

import { useEffect, useState } from "react";
import { ErrorState } from "@/components/patterns/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

type MemberRow = {
  id: string;
  role: string;
  user: { name: string; email: string };
};

export default function OrganizationSettingsClient() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [orgName, setOrgName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const org = await authClient.organization.getFullOrganization();
        if (org.data) {
          setOrgName(org.data.name);
          const list = await authClient.organization.listMembers({});
          setMembers((list.data?.members ?? []) as MemberRow[]);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Organization settings unavailable"
        description="Select an organization or complete onboarding first."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="font-semibold text-lg">Organization</h2>
        <p className="text-muted-foreground text-sm">{orgName}</p>
      </div>
      <div>
        <h3 className="mb-2 font-medium text-sm">Members</h3>
        <ul className="divide-y rounded-md border">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between px-3 py-2 text-sm"
            >
              <span>
                {member.user.name}{" "}
                <span className="text-muted-foreground">
                  ({member.user.email})
                </span>
              </span>
              <span className="text-muted-foreground capitalize">
                {member.role}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-muted-foreground text-xs">
        Invites and role management use Better Auth organization APIs; extend
        this page as needed.
      </p>
    </div>
  );
}
