import { isReservedOrgSlug } from "@loftlancer/ui/studio-routes";

/** First path segment when the request is under /[org]/… (basePath already stripped). */
export function orgSlugFromRequestPath(pathname: string): string | null {
  const [first] = pathname.split("/").filter(Boolean);
  if (!first || isReservedOrgSlug(first)) return null;
  return first;
}
