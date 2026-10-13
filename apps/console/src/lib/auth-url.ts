import { buildSignInUrl, defaultConsoleReturnTo } from "@collidr/ui/auth-links";

export function consoleSignInUrl(requestUrl?: string): string {
  const returnTo =
    requestUrl && requestUrl.startsWith("http")
      ? requestUrl
      : defaultConsoleReturnTo();
  return buildSignInUrl({ returnTo });
}
