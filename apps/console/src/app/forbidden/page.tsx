import { AppForbiddenPage } from "@loftlancer/ui/patterns/app-route-states";
import { defaultStudioReturnTo } from "@loftlancer/ui/auth-links";

const links = {
  homeHref: defaultStudioReturnTo(),
  homeLabel: "Open Studio",
};

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <AppForbiddenPage links={links} />
    </div>
  );
}
