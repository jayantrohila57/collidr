import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { siblingAuth } from "@/lib/sibling-auth";

/** Per-request cached session (avoids duplicate auth round-trips in RSC). */
export const getServerSession = cache(async () => {
  const headerList = await headers();
  return siblingAuth.api.getSession({ headers: headerList });
});

export async function getServerRequestHeaders() {
  return headers();
}
