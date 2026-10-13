"use client";

import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCan } from "../hooks/use-permissions";
import {
  type OrgHubSection,
  orgHubSectionActions,
} from "../org-section-actions";

type OrgHubSectionLinkProps = {
  slug: string;
  section: OrgHubSection;
  label: string;
};

export function OrgHubSectionLink({
  slug,
  section,
  label,
}: OrgHubSectionLinkProps) {
  const action = orgHubSectionActions[section];
  const { allowed, isLoading } = useCan(action);

  if (isLoading || !allowed) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      render={
        <Link href={`/dashboard/organizations/${slug}/${section}` as Route} />
      }
    >
      {label}
    </Button>
  );
}
