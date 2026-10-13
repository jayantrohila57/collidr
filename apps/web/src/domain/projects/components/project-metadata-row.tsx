"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  pageHeaderMetadataClassName,
  pageHeaderMetadataFieldClassName,
  pageHeaderMetadataLabelClassName,
  pageHeaderMetadataLinksRowClassName,
  pageHeaderMetadataValueClassName,
} from "@/components/layout/page-header-metadata-styles";
import { AppIcon } from "@/components/patterns/app-icon";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const ghostLinkClassName =
  "h-6 gap-1 px-1.5 text-muted-foreground hover:text-foreground";

function MetadataField({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className={pageHeaderMetadataFieldClassName}>
      <dt className={pageHeaderMetadataLabelClassName}>{label}</dt>
      <dd className={cn(pageHeaderMetadataValueClassName, mono && "font-mono")}>
        {value}
      </dd>
    </div>
  );
}

function MetadataExternalLink({
  href,
  icon,
  label,
  tooltip,
}: {
  href: string;
  icon: "github" | "externalLink";
  label: string;
  tooltip: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={ghostLinkClassName}
            render={
              <Link
                href={href as Route}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          />
        }
      >
        <AppIcon name={icon} className="size-3.5 shrink-0 text-current" />
        <span className="truncate">{label}</span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function ProjectMetadataRow({
  project,
  className,
}: {
  project: ProjectOutput;
  className?: string;
}) {
  const hasLinks = Boolean(project.repositoryUrl || project.websiteUrl);

  return (
    <dl
      data-slot="page-header-metadata"
      className={cn(pageHeaderMetadataClassName, className)}
    >
      <MetadataField label="Slug" value={project.slug} mono />
      <MetadataField
        label="Updated"
        value={formatDateTime(project.updatedAt)}
      />
      {hasLinks ? (
        <div className={pageHeaderMetadataLinksRowClassName}>
          {project.repositoryUrl ? (
            <MetadataExternalLink
              href={project.repositoryUrl}
              icon="github"
              label="Repository"
              tooltip="Open repository"
            />
          ) : null}
          {project.websiteUrl ? (
            <MetadataExternalLink
              href={project.websiteUrl}
              icon="externalLink"
              label="Website"
              tooltip="Open website"
            />
          ) : null}
        </div>
      ) : null}
    </dl>
  );
}
