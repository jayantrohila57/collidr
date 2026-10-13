"use client";

import { AppIcon } from "@/components/patterns/app-icon";
import { Button } from "@/components/ui/button";

type DataTableClearFiltersButtonProps = {
  onClick: () => void;
  label?: string;
};

export function DataTableClearFiltersButton({
  onClick,
  label = "Clear filters",
}: DataTableClearFiltersButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 px-2"
      onClick={onClick}
    >
      <AppIcon name="searchEmpty" className="me-1 size-3.5 text-current" />
      {label}
    </Button>
  );
}
