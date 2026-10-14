import "server-only";

import { enrichSessionUserRole } from "@loftlancer/api/enrich-session-user";
import { headers } from "next/headers";
import { cache } from "react";
import { siblingAuth } from "@/lib/sibling-auth";

export const getServerSession = cache(async () => {
  const headerList = await headers();
  return enrichSessionUserRole(
    await siblingAuth.api.getSession({ headers: headerList }),
  );
});
