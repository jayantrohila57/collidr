"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import type { ReactNode } from "react";
import {
  StatusBadge,
  VisibilityBadge,
} from "@/components/patterns/status-badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";

interface ProjectDetailMetadataProps {
  project: ProjectOutput;
}

function MetadataItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export function ProjectDetailMetadata({ project }: ProjectDetailMetadataProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata</CardTitle>
        <CardDescription>
          Identifiers and lifecycle details for this project.
        </CardDescription>
      </CardHeader>
      <CardPanel>
        <dl className="grid gap-2 sm:grid-cols-2">
          <MetadataItem label="Slug">
            <span className="font-mono">{project.slug}</span>
          </MetadataItem>
          <MetadataItem label="Status">
            <StatusBadge status={project.status} />
          </MetadataItem>
          <MetadataItem label="Visibility">
            <VisibilityBadge isPublic={project.isPublic} />
          </MetadataItem>
          <MetadataItem label="Archived">
            {project.isArchived ? "Yes" : "No"}
          </MetadataItem>
          <MetadataItem label="Created">
            {formatDateTime(project.createdAt)}
          </MetadataItem>
          <MetadataItem label="Last updated">
            {formatDateTime(project.updatedAt)}
          </MetadataItem>
        </dl>
      </CardPanel>
    </Card>
  );
}
