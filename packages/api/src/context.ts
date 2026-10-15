import { auth } from "@loftlancer/auth";
import type { NextRequest } from "next/server";
import { createContextWithAuth } from "./create-context";

export async function createContext(req: NextRequest) {
  return createContextWithAuth(req, auth);
}

export type { Context } from "./create-context";
