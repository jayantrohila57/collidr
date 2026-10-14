import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { siblingAuth } from "@/lib/sibling-auth";

export const getServerSession = cache(async () => {
  const headerList = await headers();
  return siblingAuth.api.getSession({ headers: headerList });
});
