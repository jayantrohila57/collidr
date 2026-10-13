"use client";

import { Eye, EyeOff, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { CopyButton } from "@/components/patterns/copy-button";
import { IconButton } from "@/components/patterns/icon-button";
import { SecretValue } from "@/components/patterns/secret-value";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";

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
  revealingIds?: Set<string>;
  onReveal: (id: string) => void;
  onEdit: (variable: Variable) => void;
  onDelete: (variable: Variable) => void;
}

export function VariablesMobileList({
  variables,
  revealedIds,
  revealingIds,
  onReveal,
  onEdit,
  onDelete,
}: VariablesMobileListProps) {
  return (
    <ul className="space-y-4 md:hidden">
      {variables.map((variable) => {
        const isRevealed = revealedIds.has(variable.id);
        return (
          <li
            key={variable.id}
            className="space-y-4 rounded-lg border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="wrap-anywhere min-w-0 flex-1 font-medium font-mono text-sm">
                {variable.key}
              </p>
              <Menu>
                <MenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-11 shrink-0"
                      aria-label="Variable actions"
                    />
                  }
                >
                  <MoreVertical className="size-4" aria-hidden />
                </MenuTrigger>
                <MenuPopup align="end">
                  <MenuItem onClick={() => onEdit(variable)}>
                    <Pencil className="me-2 h-4 w-4" />
                    Edit
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem
                    onClick={() => onDelete(variable)}
                    variant="destructive"
                  >
                    <Trash2 className="me-2 h-4 w-4" />
                    Delete
                  </MenuItem>
                </MenuPopup>
              </Menu>
            </div>
            <div className="min-w-0">
              <SecretValue revealed={isRevealed} value={variable.value} />
            </div>
            <div className="flex flex-wrap gap-2">
              <IconButton
                icon={isRevealed ? EyeOff : Eye}
                label={isRevealed ? "Hide value" : "Reveal value"}
                className="size-11"
                isLoading={revealingIds?.has(variable.id)}
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
