import { Auth5Content, Auth5Frame } from "@loftlancer/ui/patterns/auth-5";
import { ModeToggle } from "@/components/mode-toggle";
import { SiteFooter } from "@/components/site-footer";

/** auth-5 split layout for pricing, features, about and changelog. */
export default function SplitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Auth5Frame>
      <div className="absolute top-7 right-5">
        <ModeToggle />
      </div>
      <Auth5Content>
        {children}
        <div className="mx-auto w-full max-w-3xl px-4 pb-8 md:px-6">
          <SiteFooter className="border-border/60 border-t pt-4" />
        </div>
      </Auth5Content>
    </Auth5Frame>
  );
}
