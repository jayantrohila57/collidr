"use client";

import type { variableTypeSchema } from "@env-manager/api/validation";
import type { z } from "zod/v3";
import { AppIcon } from "@/components/patterns/app-icon";
import { Label } from "@/components/ui/label";
import { Radio, RadioGroup } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export type VariableType = z.infer<typeof variableTypeSchema>;

interface VariableTypeRadioCardsProps {
  value: VariableType;
  onChange: (value: VariableType) => void;
  disabled?: boolean;
}

const OPTIONS: Array<{
  value: VariableType;
  title: string;
  description: string;
  icon: "lock" | "settings";
}> = [
  {
    value: "secret",
    title: "Secret",
    description:
      "Masked after save. Values cannot be revealed or copied — overwrite only. Use for passwords, API keys, and tokens.",
    icon: "lock",
  },
  {
    value: "config",
    title: "Config",
    description:
      "Readable by members with access after save. Reveal and copy allowed. Use for non-sensitive configuration.",
    icon: "settings",
  },
];

export function VariableTypeRadioCards({
  value,
  onChange,
  disabled,
}: VariableTypeRadioCardsProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onChange(next as VariableType)}
      disabled={disabled}
      className="gap-2"
      aria-label="Variable type"
    >
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
              selected
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/40",
              disabled && "pointer-events-none opacity-60",
            )}
          >
            <Radio value={option.value} className="mt-0.5" />
            <span className="min-w-0 flex-1 space-y-0.5">
              <span className="flex items-center gap-1.5 font-medium text-sm">
                <AppIcon
                  name={option.icon}
                  className="size-4 text-foreground"
                />
                {option.title}
              </span>
              <span className="block text-muted-foreground text-xs leading-snug">
                {option.description}
              </span>
            </span>
          </Label>
        );
      })}
    </RadioGroup>
  );
}
