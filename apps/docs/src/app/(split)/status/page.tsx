import { MarketingPage } from "@/components/marketing-page";
import { StatusBoard } from "@/components/status-board";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Status",
  description:
    "Live status and uptime for the Loftlancer landing page, docs, studio and auth, from our Better Stack monitors.",
  path: "/status",
});

/** loftlancer.com/status (#369): Better Stack monitors on our own domain. */
export default function StatusPage() {
  return (
    <MarketingPage
      title="Status"
      description="Live checks of every Loftlancer surface, refreshed every minute."
    >
      <StatusBoard />
    </MarketingPage>
  );
}
