"use client";

import { Home } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useProjects } from "@/domain/projects/hooks/use-projects";
import { cn, deSlug } from "@/lib/utils";

const STATIC_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  new: "New Project",
  edit: "Edit",
};

function formatSegmentLabel(segment: string, projectName?: string) {
  if (projectName) return projectName;
  return STATIC_LABELS[segment] ?? deSlug(segment);
}

const generateBreadcrumbs = (pathname: string) => {
  const pathArray = pathname?.split("/")?.filter(Boolean);
  const breadcrumbs = pathArray.map((path, index) => {
    const href = `/${pathArray?.slice(0, index + 1)?.join("/")}`;
    return { href, label: path, segment: path };
  });
  return breadcrumbs;
};

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = generateBreadcrumbs(pathname);
  const { projects } = useProjects();

  const projectSlugFromPath = breadcrumbs[2]?.segment;
  const projectFromList =
    projectSlugFromPath &&
    breadcrumbs[1]?.segment === "projects" &&
    !["new", "edit"].includes(projectSlugFromPath)
      ? projects.find((p) => p.slug === projectSlugFromPath)
      : undefined;

  const handleBreadcrumbClick = (href: string) => {
    router.push(href as Route);
  };

  const collapseMiddle = breadcrumbs.length > 4;
  const visibleIndices = collapseMiddle
    ? [0, breadcrumbs.length - 2, breadcrumbs.length - 1]
    : breadcrumbs.map((_, i) => i);

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList
        className={cn("min-w-0 flex-nowrap overflow-hidden", className)}
      >
        <BreadcrumbItem className="shrink-0">
          <BreadcrumbLink
            href={"/"}
            aria-label="Home"
            className="inline-flex size-11 items-center justify-center"
          >
            <Home className="size-4" aria-hidden />
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbs?.map((breadcrumb, index) => {
          if (collapseMiddle && index > 0 && index < breadcrumbs.length - 2) {
            if (index === 1) {
              return (
                <React.Fragment key="ellipsis">
                  <BreadcrumbSeparator className="shrink-0">
                    {"/"}
                  </BreadcrumbSeparator>
                  <BreadcrumbItem className="shrink-0 text-muted-foreground">
                    …
                  </BreadcrumbItem>
                </React.Fragment>
              );
            }
            return null;
          }

          if (!visibleIndices.includes(index) && !collapseMiddle) {
            return null;
          }

          const isProjectSlug =
            index === 2 &&
            breadcrumbs[1]?.segment === "projects" &&
            !["new", "edit"].includes(breadcrumb.segment);

          const label = formatSegmentLabel(
            breadcrumb.segment,
            isProjectSlug ? projectFromList?.name : undefined,
          );

          return (
            <React.Fragment key={breadcrumb.href}>
              <BreadcrumbSeparator className="shrink-0 first:hidden">
                {"/"}
              </BreadcrumbSeparator>
              <BreadcrumbItem className="max-w-[5.5rem] shrink truncate sm:max-w-[8rem] md:max-w-xs">
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="truncate">{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="truncate"
                    href={breadcrumb.href}
                    onClick={() => handleBreadcrumbClick(breadcrumb.href)}
                  >
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
