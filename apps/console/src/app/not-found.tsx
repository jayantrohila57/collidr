import { AppNotFoundPage } from "@loftlancer/ui/patterns/app-route-states";

const links = { homeHref: "/" };

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <AppNotFoundPage links={links} />
    </div>
  );
}
