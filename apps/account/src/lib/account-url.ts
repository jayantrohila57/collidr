import { DEFAULT_ACCOUNT_URL } from "@env-manager/env/platform";

export function getAccountAppOrigin(): string {
  return (process.env.NEXT_PUBLIC_ACCOUNT_URL ?? DEFAULT_ACCOUNT_URL).replace(
    /\/$/,
    "",
  );
}
