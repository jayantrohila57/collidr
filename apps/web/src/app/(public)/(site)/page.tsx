import { auth } from "@env-manager/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Features from "@/domain/home/components/home.features";
import Hero from "@/domain/home/components/home.hero";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <>
      <Hero />
      <Features />
    </>
  );
}
