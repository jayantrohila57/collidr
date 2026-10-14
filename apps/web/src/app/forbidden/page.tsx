import { AppForbiddenPage } from "@loftlancer/ui/patterns/app-route-states";
import { webRouteStateLinks } from "@/lib/route-state-links";

export default function ForbiddenPage() {
  return <AppForbiddenPage links={webRouteStateLinks} />;
}
