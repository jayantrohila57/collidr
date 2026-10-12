"use client";

import { Eye, EyeOff, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { CopyButton } from "@/components/patterns/copy-button";
import { IconButton } from "@/components/patterns/icon-button";
import { SecretValue } from "@/components/patterns/secret-value";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Variable {
  id: string;
  key: string;
  value?: string;
  environmentId: string;
  createdAt: string;
  updatedAt: string;
}

interface VariablesMobileListProps {
  variables: Variable[];
  revealedIds: Set<string>;
  onReveal: (id: string) => void;
  onEdit: (variable: Variable) => void;
  onDelete: (variable: Variable) => void;
}

export function VariablesMobileList({
  variables,
  revealedIds,
  onReveal,
  onEdit,
  onDelete,
}: VariablesMobileListProps) {
  return (
    <ul className="space-y-3 md:hidden">
      {variables.map((variable) => {
        const isRevealed = revealedIds.has(variable.id);
        return (
          <li
            key={variable.id}
            className="rounded-lg border bg-card p-3 shadow-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="wrap-anywhere min-w-0 flex-1 font-medium font-mono text-sm">
                {variable.key}
              </p>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-11 shrink-0"
                    aria-label="Variable actions"
                  >
                    <MoreVertical className="size-4" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => onEdit(variable)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => onDelete(variable)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-2 min-w-0">
              <SecretValue revealed={isRevealed} value={variable.value} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <IconButton
                icon={isRevealed ? EyeOff : Eye}
                label={isRevealed ? "Hide value" : "Reveal value"}
                className="size-11"
                onClick={() => onReveal(variable.id)}
              />
              <CopyButton
                value={variable.value ?? ""}
                label="Copy value"
                disabled={!isRevealed || !variable.value}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
