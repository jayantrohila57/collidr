# Combined platform migration (single prod approval)

**Do not run on the production Neon default branch until you approve.**

## Approval artifact

One SQL file for the full delta after `0004_organizations`:

`packages/db/src/migrations/0007_platform_combined_for_prod.sql`

(Logically merges journal entries `0005` + `0006`; use this file for a single prod cut.)

## Neon branch test (completed)

- Project: `env-manager`
- Branch: `cursor-migration-test-combined` (`br-royal-rice-a11qraud`)
- Result: migration applied successfully (`audit_event`, `team`, variables v2 columns verified)

Delete the test branch when finished reviewing.

## Feature flags (after prod migration)

```env
ORGANIZATIONS_ENABLED=true
VARIABLES_V2_ENABLED=true
NOTIFICATIONS_ENABLED=true
ACTIONS_AUDIT_ENABLED=true
SOFT_DELETES_ENABLED=true
NEXT_PUBLIC_ORGANIZATIONS_ENABLED=true
NEXT_PUBLIC_VARIABLES_V2_ENABLED=true
NEXT_PUBLIC_NOTIFICATIONS_ENABLED=true
NEXT_PUBLIC_ACTIONS_AUDIT_ENABLED=true
```

Redeploy after changing `NEXT_PUBLIC_*` (inlined at build).

## Production cut policy

1. **Neon backup branch** from current default.
2. Apply `0007_platform_combined_for_prod.sql` (or reviewed `db:push` on a test branch first).
3. Enable flags above on Vercel.
4. Optional **`pnpm db:reset-seed`** — only with owner `KEEP_USER_EMAIL` and `RESET_CONFIRM=yes`; see [DB_RESET.md](./DB_RESET.md). Requires explicit human approval.

Deploy code from **`main` only** ([AGENTS.md](../AGENTS.md)).

## Drizzle schema source of truth

`packages/db/src/schema/*` — including `variable-type`, soft-delete columns, `audit_event`, `project_access`, `team`, `notification`, etc.
