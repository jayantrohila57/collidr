/** Stable TanStack Query keys matching @trpc/tanstack-react-query (no client imports). */

export function projectBySlugQueryKey(slug: string) {
  return [
    ["projects", "getBySlug"],
    { input: { slug }, type: "query" as const },
  ] as const;
}

export function projectDetailStatsQueryKey(slug: string) {
  return [
    ["dashboard", "getProjectDetailStats"],
    { input: { slug }, type: "query" as const },
  ] as const;
}
