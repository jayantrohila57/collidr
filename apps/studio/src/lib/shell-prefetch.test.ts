import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { orgSlugFromRequestPath } from "./org-slug-from-request-path";

describe("orgSlugFromRequestPath", () => {
  it("returns the first segment for org routes", () => {
    assert.equal(orgSlugFromRequestPath("/acme/projects"), "acme");
  });

  it("returns null for reserved and empty paths", () => {
    assert.equal(orgSlugFromRequestPath("/notifications"), null);
    assert.equal(orgSlugFromRequestPath("/"), null);
  });
});

describe("sidebar navigator shell prefetch", () => {
  it("does not throw when navigator prefetch fails (client refetch fallback)", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    await Promise.allSettled([
      queryClient.fetchQuery({
        queryKey: ["sidebar", "navigator", { orgSlug: "acme" }],
        queryFn: async () => {
          throw new Error("navigator down");
        },
      }),
    ]);

    assert.ok(dehydrate(queryClient));
  });
});
