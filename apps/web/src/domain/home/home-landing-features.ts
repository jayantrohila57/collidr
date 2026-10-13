import type { LucideIcon } from "lucide-react";
import { Activity, FolderKanban, Github, KeyRound, Layers } from "lucide-react";

export type HomeLandingFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const homeLandingFeatures: HomeLandingFeature[] = [
  {
    icon: KeyRound,
    title: "Encrypted variables",
    description:
      "Secrets encrypted at rest; values stay masked until you reveal them.",
  },
  {
    icon: Layers,
    title: "Per-environment tabs",
    description:
      "Dev, staging, and production targets in one project workspace.",
  },
  {
    icon: FolderKanban,
    title: "Projects",
    description:
      "Organize variables by repository with slugs, status, and visibility.",
  },
  {
    icon: Activity,
    title: "Activity log",
    description:
      "See recent changes in an audit-style feed for your workspace.",
  },
  {
    icon: Github,
    title: "GitHub sign-in",
    description: "Authenticate with GitHub—no separate password to manage.",
  },
];
