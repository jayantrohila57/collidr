import { validateReturnTo } from "@env-manager/auth/return-to";
import { redirect } from "next/navigation";

export default async function SignOutPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string }>;
}) {
  const { return_to } = await searchParams;
  const returnTo = validateReturnTo(return_to);
  redirect(`/api/auth/sign-out?return_to=${encodeURIComponent(returnTo)}`);
}
