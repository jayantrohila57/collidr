import { isNull, type SQL } from "drizzle-orm";
import type { AnyColumn } from "drizzle-orm/column";

/** Default filter: row is not soft-deleted. */
export function notDeleted(deletedAtColumn: AnyColumn): SQL {
  return isNull(deletedAtColumn);
}
