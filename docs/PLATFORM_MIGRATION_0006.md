# Platform migration `0006` (actions, permissions, audit timeline)

**Do not run against production until you explicitly approve.** Apply on a local Postgres or Neon branch first, then enable feature flags.

Runs after `0005_platform_variables_and_notifications.sql`. For production, approve **0005 + 0006** in one cut (or back-to-back in the same window).

## Feature flags (after migration)

Server (`.env`):

```env
ACTIONS_AUDIT_ENABLED=true
```

Client (inlined at build):

```env
NEXT_PUBLIC_ACTIONS_AUDIT_ENABLED=true
```

Defaults are `false` until migration is applied.

## Includes

- Better Auth `team` / `team_member` tables
- `project_manager`, `project_team`, `project_member_grant`
- `action_block`, `audit_event` (+ backfill from `audit_log`)
- Soft-delete columns (`deleted_at`, `deleted_by`) on org, project, environment, variable, notification
- Partial unique index on `project.slug` where `deleted_at IS NULL`
- `member.role`: legacy `admin` → `manager`

## Full SQL

See `packages/db/src/migrations/0006_actions_permissions_audit.sql`.

## Route redirects (when flags on)

- `/dashboard/activity` → `/dashboard/timeline`
- `/dashboard/settings/organization` → `/dashboard/organizations` or `/dashboard/organizations/[slug]`
