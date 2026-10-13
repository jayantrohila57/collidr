import { AppNotFoundPage } from "@env-manager/ui/patterns/app-route-states";
import { studioRouteStateLinks } from "@/lib/route-state-links";

export default function NotFound() {
  return <AppNotFoundPage links={studioRouteStateLinks} />;
}
