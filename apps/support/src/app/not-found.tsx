import { AppNotFoundPage } from "@loftlancer/ui/patterns/app-route-states";

const links = { homeHref: "/" };

export default function NotFound() {
  return <AppNotFoundPage links={links} />;
}
