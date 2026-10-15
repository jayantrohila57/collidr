import { AppNotFoundPage } from "@loftlancer/ui/patterns/app-route-states";

const links = { homeHref: "/sign-in" };

export default function NotFound() {
  return <AppNotFoundPage links={links} />;
}
