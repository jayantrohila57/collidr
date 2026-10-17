import { cn as cnBase } from "@loftlancer/ui/utils";

export const cn = cnBase;

export function deSlug(value: string): string {
  return value
    .split("-")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
    .join(" ");
}
