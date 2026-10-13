import type { LucideIcon } from "lucide-react";
import { Activity, Boxes, Layers, Lock } from "lucide-react";
import { GithubIcon } from "../components/icons/github-icon";

export type MarketingFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const marketingFeatures: MarketingFeature[] = [
  {
    icon: Lock,
    title: "Encrypted at rest",
    description:
      "Secrets are encrypted in the database and masked in the UI until you choose to reveal them.",
  },
  {
    icon: Layers,
    title: "Per-environment targets",
    description:
      "Dev, staging, and production variables live in one project—with clear separation.",
  },
  {
    icon: Boxes,
    title: "Projects & organizations",
    description:
      "Group repositories, invite teammates, and control access with org roles.",
  },
  {
    icon: Activity,
    title: "Activity timeline",
    description:
      "See who changed what with an audit-style feed across your workspace.",
  },
  {
    icon: GithubIcon,
    title: "GitHub sign-in",
    description:
      "Authenticate with GitHub—no extra passwords to rotate or forget.",
  },
];
