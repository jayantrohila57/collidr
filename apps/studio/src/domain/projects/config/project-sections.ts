import type { Route } from "next";
import type { AppIconName } from "@/lib/icons";

export type ProjectSectionId = "environments";

export type ProjectSectionDefinition = {
  id: ProjectSectionId;
  title: string;
  description: string;
  icon: AppIconName;
  href: (projectSlug: string) => Route;
};

export const PROJECT_SECTIONS: readonly ProjectSectionDefinition[] = [
  {
    id: "environments",
    title: "Environments & variables",
    description:
      "Deployment targets, secrets, and configuration per environment.",
    icon: "environment",
    href: (projectSlug) => `/p/${projectSlug}/env` as Route,
  },
];
