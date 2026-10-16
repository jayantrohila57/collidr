import { Auth5Content, Auth5Frame } from "@loftlancer/ui/patterns/auth-5";
import { AppForbiddenPage } from "@loftlancer/ui/patterns/app-route-states";
import { studioRouteStateLinks } from "@/lib/route-state-links";

export default function ForbiddenPage() {
  return (
    <Auth5Frame>
      <Auth5Content>
        <AppForbiddenPage links={studioRouteStateLinks} />
      </Auth5Content>
    </Auth5Frame>
  );
}
