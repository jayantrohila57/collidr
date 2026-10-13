import "server-only";

import { auth } from "@env-manager/auth";
import { headers } from "next/headers";
import { cache } from "react";

export const getServerSession = cache(async () => {
  const headerList = await headers();
  return auth.api.getSession({ headers: headerList });
});
