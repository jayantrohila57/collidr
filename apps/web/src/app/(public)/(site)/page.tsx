import Shell from "@/components/shell";
import Features from "@/domain/home/components/home.features";
import Hero from "@/domain/home/components/home.hero";

export default function Home() {
  return (
    <Shell>
      <Shell.Section>
        <Hero />
      </Shell.Section>
      <Shell.Section>
        <Features />
      </Shell.Section>
    </Shell>
  );
}
