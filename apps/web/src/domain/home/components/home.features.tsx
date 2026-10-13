"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Building2,
  Check,
  FolderKanban,
  Github,
  KeyRound,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { GitHubLoginButton } from "@/domain/auth/components/github-login";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { layoutGapClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";
import { MarketingSectionHeading } from "./marketing-section-heading";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  details: string[];
};

const features: Feature[] = [
  {
    icon: KeyRound,
    title: "Encrypted variables",
    description:
      "Secrets are encrypted at rest. Values stay masked in the UI until you choose to reveal them.",
    details: [
      "Encryption at rest",
      "Masked values in the dashboard",
      "Per-environment variable lists",
    ],
  },
  {
    icon: Layers,
    title: "Environments per project",
    description:
      "Model dev, staging, production, or any targets you need for each repository.",
    details: [
      "Multiple environments per project",
      "Tabbed environment workspace",
      "Create and rename environments",
    ],
  },
  {
    icon: FolderKanban,
    title: "Projects workspace",
    description:
      "Organize variables by project with slugs, visibility, and status at a glance.",
    details: [
      "Project list and detail views",
      "Repository and website links",
      "Quick navigation sidebar",
    ],
  },
  {
    icon: Building2,
    title: "Organizations",
    description:
      "Switch workspaces when teams are enabled, with organization settings and members.",
    details: [
      "Organization switcher",
      "Member roles when enabled",
      "Org-level settings",
    ],
  },
  {
    icon: Activity,
    title: "Activity log",
    description:
      "Review recent changes in an audit-style activity feed for your workspace.",
    details: [
      "Dashboard activity summary",
      "Filterable audit log",
      "Timestamps on events",
    ],
  },
  {
    icon: Github,
    title: "GitHub sign-in",
    description:
      "Authenticate with GitHub to get started—no separate password to manage.",
    details: [
      "OAuth via GitHub",
      "Session-based access",
      "Redirect to dashboard after sign-in",
    ],
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="gap-3">
        <Icon className="size-5 text-muted-foreground" aria-hidden />
        <CardTitle className="text-base">{feature.title}</CardTitle>
        <CardDescription>{feature.description}</CardDescription>
      </CardHeader>
      <CardPanel className="mt-auto pt-0">
        <ul className="space-y-2">
          {feature.details.map((detail) => (
            <li
              key={detail}
              className="flex items-start gap-2 text-muted-foreground text-sm"
            >
              <Check
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </CardPanel>
    </Card>
  );
}

export default function Features() {
  const { data: session, isPending } = useSession();

  return (
    <section id="features" className={cn("flex flex-col", layoutGapClass)}>
      <MarketingSectionHeading
        badge="Features"
        title="Built for environment management"
        description="Practical tools for storing variables, organizing projects, and keeping work visible to your team."
      />
      <ul
        className={cn(
          "grid list-none gap-4 p-0",
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {features.map((feature) => (
          <li key={feature.title} className="min-h-0">
            <FeatureCard feature={feature} />
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-3 border-t pt-8">
        <MarketingSectionHeading
          title="Ready to try it?"
          description="Sign in with GitHub to create projects and manage environment variables in your workspace."
        />
        <div className="flex flex-wrap items-center gap-2">
          {isPending ? (
            <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
          ) : session?.user ? (
            <Button render={<Link href="/dashboard" />}>Open dashboard</Button>
          ) : (
            <GitHubLoginButton size="default" />
          )}
        </div>
      </div>
    </section>
  );
}
