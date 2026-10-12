import Shell from "@/components/shell";
import Footer from "@/domain/home/components/home.footer";
import Header from "@/domain/home/components/home.header";

interface SiteLayoutProps {
  children: React.ReactNode;
}

export default async function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <Shell>
      <Shell.Header variant={"sticky"}>
        <Header />
      </Shell.Header>
      <Shell.Main>{children}</Shell.Main>
      <Shell.Footer>
        <Footer />
      </Shell.Footer>
    </Shell>
  );
}
