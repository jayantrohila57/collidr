import "server-only";

import { enrichSessionUserRole } from "@collidr/api/enrich-session-user";
import { headers } from "next/headers";
import { cache } from "react";
import { siblingAuth } from "@/lib/sibling-auth";

/** Per-request cached session (avoids duplicate auth round-trips in RSC). */
export const getServerSession = cache(async () => {
  const headerList = await headers();
  return enrichSessionUserRole(
    await siblingAuth.api.getSession({ headers: headerList }),
  );
});

export async function getServerRequestHeaders() {
  return headers();
}
