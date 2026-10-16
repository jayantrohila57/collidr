import { Auth5Content, Auth5Frame } from "@loftlancer/ui/patterns/auth-5";
import { ModeToggle } from "@/components/mode-toggle";

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
      <Auth5Content>{children}</Auth5Content>
    </Auth5Frame>
  );
}
