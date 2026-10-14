import { AppForbiddenPage } from "@loftlancer/ui/patterns/app-route-states";
import { studioRouteStateLinks } from "@/lib/route-state-links";

export default function ForbiddenPage() {
  return <AppForbiddenPage links={studioRouteStateLinks} />;
}
