import { DEFAULT_AUTH_URL } from "@loftlancer/env/platform";

export function getAccountAppOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_AUTH_URL ??
    process.env.NEXT_PUBLIC_ACCOUNT_URL ??
    DEFAULT_AUTH_URL
  ).replace(
    /\/$/,
    "",
  );
}
