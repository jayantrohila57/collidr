import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Minimum 44px hit area on phones and coarse pointers (WCAG touch target). */
export const touchTarget =
  "max-sm:min-h-11 max-sm:min-w-11 [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11";

export function slugToTitle(slug: string | null | undefined): string {
  if (!slug) return "";

  return slug
    .replace(/[-_]+/g, " ") // replace slug separators with spaces
    .replace(/\s+/g, " ") // collapse multiple spaces
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize each word
}

export function deSlug(slug: string | null | undefined): string {
  if (!slug) return "";

  return slug
    .replace(/[-_]+/g, " ") // replace hyphens and underscores with spaces
    .replace(/\s+/g, " ") // collapse multiple spaces into one
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize first letter of each word
}

export function deSlugWithOriginal(slug: string | null | undefined): string {
  if (!slug) return "";

  // More sophisticated deslug that handles acronyms and special cases
  return slug
    .replace(/[-_]+/g, " ") // replace separators with spaces
    .replace(/\s+/g, " ") // collapse multiple spaces
    .trim()
    .replace(/\b[a-z]/g, (char) => char.toUpperCase()) // capitalize first letter of each word
    .replace(/\b(API|URL|ID|CSS|HTML|JS|TS|UI|UX)\b/g, (match) => match); // keep common acronyms uppercase
}

export function nameToSlug(name: string | null | undefined): string {
  if (!name) return "";

  return name
    .normalize("NFKD") // remove diacritics (café → cafe)
    .replace(/[^\p{L}\p{N}]+/gu, "-") // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .toLowerCase();
}
