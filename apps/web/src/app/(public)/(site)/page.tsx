import { auth } from "@env-manager/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Shell from "@/components/shell";
import { Frame } from "@/components/ui/frame";
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
    <Shell>
      <Frame className="w-full">
        <Hero />
      </Frame>
      <Frame className="w-full">
        <Features />
      </Frame>
    </Shell>
  );
}
