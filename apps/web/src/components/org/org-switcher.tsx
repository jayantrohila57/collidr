"use client";

import { Building2, ChevronsUpDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

type OrgListItem = {
  id: string;
  name: string;
  slug: string;
};

export function OrgSwitcher() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<OrgListItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOrganizationsEnabledOnClient()) {
      setLoading(false);
      return;
    }

    void (async () => {
      try {
        const list = await authClient.organization.list();
        const data = (list.data ?? []) as OrgListItem[];
        setOrgs(data);
        const session = await authClient.getSession();
        const active =
          (session.data?.session as { activeOrganizationId?: string })
            ?.activeOrganizationId ??
          data[0]?.id ??
          null;
        setActiveId(active);
      } catch {
        toast.error("Could not load organizations");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!isOrganizationsEnabledOnClient()) {
    return null;
  }

  const active = orgs.find((o) => o.id === activeId) ?? orgs[0];

  const setActive = async (organizationId: string) => {
    await authClient.organization.setActive({ organizationId });
    setActiveId(organizationId);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="mb-2 w-full justify-between gap-2"
          disabled={loading}
          aria-label="Switch organization"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {active?.name?.slice(0, 2).toUpperCase() ?? "OR"}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm">
              {loading ? "Loading…" : (active?.name ?? "Select organization")}
            </span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        {orgs.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onSelect={() => void setActive(org.id)}
          >
            <Building2 className="mr-2 h-4 w-4" />
            <span className="truncate">{org.name}</span>
            {org.id === activeId && (
              <span className="ml-auto text-muted-foreground text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/dashboard/onboarding")}>
          <Plus className="mr-2 h-4 w-4" />
          Create organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
