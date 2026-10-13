import { AppForbiddenPage } from "@collidr/ui/patterns/app-route-states";
import { webRouteStateLinks } from "@/lib/route-state-links";

export default function ForbiddenPage() {
  return <AppForbiddenPage links={webRouteStateLinks} />;
}
