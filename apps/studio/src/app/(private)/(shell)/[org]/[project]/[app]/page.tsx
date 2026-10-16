import { notFound } from "next/navigation";

/** Installed apps have static routes (env, tasks); anything else is unknown. */
export default function UnknownAppRoute(): never {
  notFound();
}
