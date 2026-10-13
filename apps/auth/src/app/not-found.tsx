import { AppNotFoundPage } from "@collidr/ui/patterns/app-route-states";

const links = { homeHref: "/sign-in" };

export default function NotFound() {
  return <AppNotFoundPage links={links} />;
}
