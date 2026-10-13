import Shell from "@/components/shell";
import Footer from "@/domain/home/components/home.footer";
import Header from "@/domain/home/components/home.header";
import { marketingContainerClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

interface SiteLayoutProps {
  children: React.ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <Shell>
      <Shell.Header variant="sticky" className="border-b bg-background">
        <div className={cn(marketingContainerClass, "py-2")}>
          <Header />
        </div>
      </Shell.Header>
      <Shell.Main className="flex flex-col gap-12 py-8 md:gap-16 md:py-12">
        <div className={marketingContainerClass}>{children}</div>
      </Shell.Main>
      <Shell.Footer
        padding="none"
        className="w-full max-w-none border-t bg-background"
      >
        <div className={marketingContainerClass}>
          <Footer />
        </div>
      </Shell.Footer>
    </Shell>
  );
}
