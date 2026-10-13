import { AppForbiddenPage } from "@env-manager/ui/patterns/app-route-states";

const links = {
  homeHref: "/",
  dashboardHref: "/settings",
};

export default function ForbiddenPage() {
  return <AppForbiddenPage links={links} />;
}
