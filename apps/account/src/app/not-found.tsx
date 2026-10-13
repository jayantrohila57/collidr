import { AppNotFoundPage } from "@collidr/ui/patterns/app-route-states";

const links = { homeHref: "/", dashboardHref: "/settings" };

export default function NotFound() {
  return <AppNotFoundPage links={links} />;
}
