import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { MarketingPage } from "@/components/marketing-page";

export const metadata = {
  title: "Changelog",
  description: "Release notes from the repository CHANGELOG.",
};

async function loadChangelog(): Promise<string> {
  try {
    return await readFile(join(process.cwd(), "../../CHANGELOG.md"), "utf8");
  } catch {
    return "# Changelog\n\nSee the repository on GitHub for release history.";
  }
}

export default async function ChangelogPage() {
  const raw = await loadChangelog();

  return (
    <MarketingPage
      title="Changelog"
      description="High-level changes tracked in the monorepo CHANGELOG."
    >
      <pre className="not-prose overflow-x-auto whitespace-pre-wrap rounded-lg border bg-muted/20 p-4 font-mono text-sm">
        {raw}
      </pre>
    </MarketingPage>
  );
}
