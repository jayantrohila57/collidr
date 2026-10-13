export { cn } from "cn";

/** Minimum 44px hit area on phones and coarse pointers (WCAG touch target). */
export const touchTarget =
  "max-sm:min-h-11 max-sm:min-w-11 [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11";

export function slugToTitle(slug: string | null | undefined): string {
  if (!slug) return "";

  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function deSlug(slug: string | null | undefined): string {
  if (!slug) return "";

  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function deSlugWithOriginal(slug: string | null | undefined): string {
  if (!slug) return "";

  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b[a-z]/g, (char) => char.toUpperCase())
    .replace(/\b(API|URL|ID|CSS|HTML|JS|TS|UI|UX)\b/g, (match) => match);
}

export function nameToSlug(name: string | null | undefined): string {
  if (!name) return "";

  return name
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}
