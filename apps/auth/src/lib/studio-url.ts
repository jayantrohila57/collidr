import { DEFAULT_STUDIO_URL } from "@loftlancer/env/platform";

export function getStudioAppOrigin(): string {
  return (process.env.NEXT_PUBLIC_STUDIO_URL ?? DEFAULT_STUDIO_URL).replace(
    /\/$/,
    "",
  );
}

export function studioDashboardPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getStudioAppOrigin()}${normalized}`;
}
