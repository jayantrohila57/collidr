import { Auth5Content, Auth5Frame } from "@loftlancer/ui/patterns/auth-5";
import { AppNotFoundPage } from "@loftlancer/ui/patterns/app-route-states";
import { studioRouteStateLinks } from "@/lib/route-state-links";

export default function NotFound() {
  return (
    <Auth5Frame>
      <Auth5Content>
        <AppNotFoundPage links={studioRouteStateLinks} />
      </Auth5Content>
    </Auth5Frame>
  );
}
