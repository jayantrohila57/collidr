import "server-only";

import { auth } from "@collidr/auth";
import { headers } from "next/headers";
import { cache } from "react";

/** Per-request cached session (avoids duplicate auth round-trips in RSC). */
export const getServerSession = cache(async () => {
  const headerList = await headers();
  return auth.api.getSession({ headers: headerList });
});

export async function getServerRequestHeaders() {
  return headers();
}
