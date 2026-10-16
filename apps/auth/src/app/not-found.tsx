import { AppNotFoundPage } from "@loftlancer/ui/patterns/app-route-states";
import { Auth5Panel } from "@loftlancer/ui/patterns/auth-5";

const links = { homeHref: "/settings" };

export default function NotFound() {
  return (
    <Auth5Panel showTerms={false}>
      <AppNotFoundPage links={links} />
    </Auth5Panel>
  );
}
