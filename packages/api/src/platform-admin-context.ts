import { AsyncLocalStorage } from "node:async_hooks";

import { registerPlatformAdminReader } from "@collidr/actions/platform-admin-flag";

type Store = { platformAdmin: boolean };

const storage = new AsyncLocalStorage<Store>();

registerPlatformAdminReader(() => storage.getStore()?.platformAdmin ?? false);

export function runWithPlatformAdminContext<T>(
  platformAdmin: boolean,
  fn: () => T,
): T {
  return storage.run({ platformAdmin }, fn);
}
