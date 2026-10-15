import { auth } from "@loftlancer/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import HomeSplitLanding from "@/domain/home/components/home-split-landing";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/dashboard");
  }

  return <HomeSplitLanding />;
}
