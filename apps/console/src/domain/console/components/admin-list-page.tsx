"use client";

import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConsolePageHeader } from "@/domain/console/components/console-page-header";
import { QueryErrorState } from "@/domain/console/components/query-state";

type AdminListPageProps = {
  title: string;
  description?: string;
  searchLabel?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchWidthClassName?: string;
  headerActions?: ReactNode;
  isError?: boolean;
  errorMessage?: string;
  children: ReactNode;
};

export function AdminListPage({
  title,
  description,
  searchLabel = "Search",
  search,
  onSearchChange,
  searchWidthClassName = "w-56",
  headerActions,
  isError,
  errorMessage = "Could not load data.",
  children,
}: AdminListPageProps) {
  return (
    <div className="space-y-4">
      <ConsolePageHeader title={title} description={description}>
        <div className="flex flex-wrap items-end gap-3">
          {onSearchChange !== undefined && search !== undefined ? (
            <div className="text-sm">
              <Label className="text-muted-foreground">{searchLabel}</Label>
              <Input
                className={`mt-1 ${searchWidthClassName}`}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          ) : null}
          {headerActions}
        </div>
      </ConsolePageHeader>

      {isError ? <QueryErrorState message={errorMessage} /> : null}

      {children}
    </div>
  );
}
