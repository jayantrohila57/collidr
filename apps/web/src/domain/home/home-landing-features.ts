import type { AppIconName } from "@/lib/icons";

export type HomeLandingFeature = {
  icon: AppIconName;
  title: string;
  description: string;
};

export const homeLandingFeatures: HomeLandingFeature[] = [
  {
    icon: "variable",
    title: "Encrypted variables",
    description:
      "Secrets encrypted at rest; values stay masked until you reveal them.",
  },
  {
    icon: "environment",
    title: "Per-environment tabs",
    description:
      "Dev, staging, and production targets in one project workspace.",
  },
  {
    icon: "project",
    title: "Projects",
    description:
      "Organize variables by repository with slugs, status, and visibility.",
  },
  {
    icon: "activity",
    title: "Activity log",
    description:
      "See recent changes in an audit-style feed for your workspace.",
  },
  {
    icon: "github",
    title: "GitHub sign-in",
    description: "Authenticate with GitHub—no separate password to manage.",
  },
];
