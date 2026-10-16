import { AppNotFoundPage } from "@loftlancer/ui/patterns/app-route-states";
import { Auth5Content, Auth5Frame } from "@loftlancer/ui/patterns/auth-5";
import type { Metadata } from "next";
import { studioRouteStateLinks } from "@/lib/route-state-links";
import { NOT_FOUND_DOCUMENT_TITLE } from "@/lib/siteConfig";

// Root not-found can export metadata (#317).
export const metadata: Metadata = {
  title: { absolute: NOT_FOUND_DOCUMENT_TITLE },
};

export default function NotFound() {
  return (
    <Auth5Frame>
      <Auth5Content>
        <AppNotFoundPage links={studioRouteStateLinks} />
      </Auth5Content>
    </Auth5Frame>
  );
}
