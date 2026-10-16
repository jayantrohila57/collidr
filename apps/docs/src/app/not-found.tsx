import { Auth5Content, Auth5Frame } from "@loftlancer/ui/patterns/auth-5";
import { AppNotFoundPage } from "@loftlancer/ui/patterns/app-route-states";

const links = { homeHref: "/" };

export default function NotFound() {
  return (
    <Auth5Frame>
      <Auth5Content>
        <AppNotFoundPage links={links} />
      </Auth5Content>
    </Auth5Frame>
  );
}
