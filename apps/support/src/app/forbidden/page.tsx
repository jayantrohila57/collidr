import { AppForbiddenPage } from "@loftlancer/ui/patterns/app-route-states";

const links = { homeHref: "/", dashboardHref: "/tickets" };

export default function ForbiddenPage() {
  return <AppForbiddenPage links={links} />;
}
