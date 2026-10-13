import { AppNotFoundPage } from "@env-manager/ui/patterns/app-route-states";
import { webRouteStateLinks } from "@/lib/route-state-links";

export default function NotFound() {
  return <AppNotFoundPage links={webRouteStateLinks} />;
}
