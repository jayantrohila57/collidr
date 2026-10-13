import { DEFAULT_WWW_URL } from "@env-manager/auth";
import type { Route } from "next";
import { redirect } from "next/navigation";

export default function Home() {
  const www = (process.env.NEXT_PUBLIC_WWW_URL ?? DEFAULT_WWW_URL).replace(
    /\/$/,
    "",
  );
  redirect(www as Route);
}
