import type { Metadata, Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { Button } from "@/components/ui/button";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";

export const metadata: Metadata = {
  title: "Organization",
  description: "Organization hub.",
};

const sections = [
  { href: "members", label: "Members" },
  { href: "teams", label: "Teams" },
  { href: "invitations", label: "Invitations" },
  { href: "roles", label: "Roles & access" },
  { href: "settings", label: "Settings" },
  { href: "timeline", label: "Timeline" },
] as const;

export default async function OrganizationHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!isActionsAuditEnabledOnClient()) {
    redirect("/dashboard/settings/organization");
  }

  const { slug } = await params;

  return (
    <DashboardSection title="Organization" description={`Hub for ${slug}`}>
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <Button
            key={section.href}
            variant="outline"
            size="sm"
            render={
              <Link
                href={
                  `/dashboard/organizations/${slug}/${section.href}` as Route
                }
              />
            }
          >
            {section.label}
          </Button>
        ))}
      </div>
    </DashboardSection>
  );
}
