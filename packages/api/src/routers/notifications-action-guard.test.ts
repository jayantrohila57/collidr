import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const routerSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "notifications.ts"),
  "utf8",
);

function procedureBlock(name: string, nextName: string): string {
  const match = routerSource.match(
    new RegExp(`${name}:\\s*protectedProcedure[\\s\\S]*?${nextName}:`),
  )?.[0];
  assert.ok(match, `expected ${name} procedure in notifications router`);
  return match;
}

describe("notifications router action guards", () => {
  it("guards markUnread with notification.mark_unread", () => {
    const block = procedureBlock("markUnread", "markAllRead");
    assert.match(block, /actionGuard\("notification\.mark_unread"\)/);
  });

  it("guards markRead and markAllRead with notification.mark_read", () => {
    const markRead = procedureBlock("markRead", "markUnread");
    assert.match(markRead, /actionGuard\("notification\.mark_read"\)/);

    const markAllRead = procedureBlock("markAllRead", "syncInvitationReceived");
    assert.match(markAllRead, /actionGuard\("notification\.mark_read"\)/);
  });
});
