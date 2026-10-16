import { MarketingPage } from "@/components/marketing-page";

export const metadata = {
  title: "Pricing",
  description: "Loftlancer is free while we ship the platform split.",
};

export default function PricingPage() {
  return (
    <MarketingPage
      title="Pricing"
      description="Simple and free for now — no paid plans are configured in the product."
    >
      <div className="not-prose rounded-xl border bg-muted/30 p-8 text-center">
        <p className="font-semibold text-2xl">Free</p>
        <p className="mt-2 text-muted-foreground">
          Use the studio, organizations, encryption, and MCP tools at no charge
          during early access.
        </p>
      </div>
      <p className="mt-8">
        Billing is not implemented in the codebase. When pricing changes, this
        page and the docs will be updated before any charges apply.
      </p>
    </MarketingPage>
  );
}
