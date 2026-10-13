"use client";

import type { OrgListItem } from "@/components/org/active-organization-context";
import { layoutGapClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";
import { OrganizationCard } from "./organization-card";

export function OrganizationsGridView({
  orgs,
  activeOrganizationId,
  className,
}: {
  orgs: OrgListItem[];
  activeOrganizationId: string | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3",
        layoutGapClass,
        className,
      )}
    >
      {orgs.map((org) => (
        <OrganizationCard
          key={org.id}
          org={org}
          isActive={org.id === activeOrganizationId}
        />
      ))}
    </div>
  );
}
