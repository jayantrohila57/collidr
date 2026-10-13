import { notFound } from "next/navigation";

/** Unknown `/dashboard/*` routes — render in-shell not-found via `(private)/not-found`. */
export default function DashboardUnknownRoutePage() {
  notFound();
}
