# Dev performance profiling (agent notes)

## Hot paths measured

Run on a Neon dev branch with `DATABASE_URL` set:

```bash
cd packages/api
SKIP_ENV_VALIDATION=1 DATABASE_URL='…' pnpm exec tsx scripts/profile-hot-paths.mjs
```

The script prints wall time and approximate SQL round-trips for:

- `fetchUserAccountStats` (auth profile stat cards)
- `buildPermissionsSnapshot` (studio permission gates / `Can`)

## Indexes (pending approval)

See `packages/db/src/migrations/0013_perf_query_indexes.sql`. **Not applied to production.**

Apply on dev first:

```bash
psql "$DATABASE_URL" -f packages/db/src/migrations/0013_perf_query_indexes.sql
```

## Sample timings (Neon dev `env-manager`, 2026-10-14)

| Path | Before (approx.) | After batching `action_block` |
|------|------------------|-------------------------------|
| `fetchUserAccountStats` | ~1.5s (2 queries; cold pool) | unchanged |
| `buildPermissionsSnapshot` | ~18s, **86 queries** | **~0.5s**, **2 queries** |

## Code-side mitigations (already on dev)

- Permissions snapshot: single `action_block` query per snapshot (was N per action).
- Permissions snapshot: 60s stale time, no refetch on window focus (studio).
- Audit timeline: narrower passive filter (reads + `audit.timeline.view.*` only); default exclude denied probes.
- Self-only denied permission checks are not written to `audit_event` (stops false “Delete account” rows).
