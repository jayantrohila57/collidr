import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function deSlug(value: string): string {
  return value
    .split("-")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
    .join(" ");
}

/**
 * Header chrome (bell, theme, avatar, sidebar trigger): one dense size-8
 * square with the same radius and soft border everywhere (ReUI dense rules).
 */
export const headerIconButtonClassName =
  "size-8 shrink-0 rounded-md border-border/60 shadow-none before:rounded-[calc(var(--radius-md)-1px)] [&_svg:not([class*='size-'])]:size-4";
