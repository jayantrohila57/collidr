import { DEFAULT_ACCOUNT_URL } from "@loftlancer/env/platform";
import { redirect } from "next/navigation";

const accountOrigin = (
  process.env.NEXT_PUBLIC_ACCOUNT_URL ?? DEFAULT_ACCOUNT_URL
).replace(/\/$/, "");

export default function SettingsRoute() {
  redirect(`${accountOrigin}/settings/profile` as never);
}
