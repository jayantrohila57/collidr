import { AppNotFoundPage } from "@env-manager/ui/patterns/app-route-states";

const links = { homeHref: "/" };

export default function NotFound() {
  return <AppNotFoundPage links={links} />;
}
