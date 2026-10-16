import { guardAuthenticatedPage } from "@/lib/page-guards";

/** Auth guard for every private route; chrome lives in the child groups. */
export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardAuthenticatedPage();
  return children;
}
