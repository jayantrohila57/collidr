import { AppNotFoundPage } from "@collidr/ui/patterns/app-route-states";

const links = { homeHref: "/" };

export default function NotFound() {
  return <AppNotFoundPage links={links} />;
}
