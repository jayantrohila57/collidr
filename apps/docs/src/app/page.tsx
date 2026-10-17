import { HomeJsonLd } from "@/components/json-ld";
import { Landing } from "@/components/landing";
import { pageMetadata, siteDescription } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Loftlancer: organizations, projects and encrypted environments",
  description: siteDescription,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <Landing />
    </>
  );
}
