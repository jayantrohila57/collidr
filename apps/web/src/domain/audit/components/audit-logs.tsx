"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAudit } from "../hooks/use-audit";
import { AuditLogTableView } from "./audit-log-table-view";

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("ALL");

  const { logs, projects, status, revealedIds, toggleReveal } = useAudit({
    search: searchTerm,
    projectId: selectedProjectId === "ALL" ? undefined : selectedProjectId,
  });

  const projectFilter = (
    <Select
      value={selectedProjectId}
      items={[
        { value: "ALL", label: "All Projects" },
        ...projects.map((project) => ({
          value: project.id,
          label: project.name,
        })),
      ]}
      onValueChange={(value) => {
        if (value) setSelectedProjectId(value);
      }}
    >
      <SelectTrigger className="w-full sm:w-48" aria-label="Filter by project">
        <SelectValue placeholder="Filter by Project" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All Projects</SelectItem>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <AuditLogTableView
      logs={logs}
      isLoading={status === "loading"}
      revealedIds={revealedIds}
      onToggleReveal={toggleReveal}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filter={projectFilter}
    />
  );
}
