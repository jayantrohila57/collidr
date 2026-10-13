"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-10"
          />
        </div>
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
          <SelectTrigger className="w-full sm:w-48">
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
      </div>

      <AuditLogTableView
        logs={logs}
        status={status}
        revealedIds={revealedIds}
        onToggleReveal={toggleReveal}
      />
    </div>
  );
}
