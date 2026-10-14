import { AppNotFoundPage } from "@loftlancer/ui/patterns/app-route-states";

const links = { homeHref: "/", dashboardHref: "/dashboard" };

export default function NotFound() {
  return <AppNotFoundPage links={links} />;
}
