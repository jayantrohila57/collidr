const DEFAULT_DOCS_URL = "https://collidr.vercel.app/docs";

function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/** Public docs site URL (`apps/docs`). */
export function docsSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_DOCS_URL?.trim() ?? DEFAULT_DOCS_URL;
  return trimTrailingSlash(raw);
}
