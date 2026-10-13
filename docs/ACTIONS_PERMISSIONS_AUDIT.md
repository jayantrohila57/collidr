# Actions, permissions & audit timeline — research & design spec

**Status:** Design only (no implementation in this phase).  
**Bundles with:** pending platform migration train (after approved `0005`; proposed **`0006_actions_permissions_audit`**).  
**Authoritative intent:** one canonical action name per user-visible or security-sensitive operation; that name drives audit logging, authorization, block lists, and UI gating.

---

## 1. Executive summary

Today the product logs a subset of mutations to `audit_log` with ad-hoc `action` enums (`CREATE`, `UPDATE`, …) and `entityType` (`PROJECT`, `VARIABLE`, …). Access control is effectively **project owner + active org membership** (`project.userId`, `member.role` in `owner` | `admin` | `member`) with no project teams, no manager scoping, and no platform admin role in schema. The Activity page reads **only the current user’s** audit rows.

This spec introduces:

1. **`@env-manager/actions` registry** — single source of truth for action metadata, Better Auth organization statements/roles, project-level grants, audit payloads, notification triggers, and UI `requiredAction`.
2. **`requireAction(action, ctx)`** — server gate used by tRPC (and Better Auth hooks where applicable): platform admin → block list → org role → project grant; **always** writes `audit_event` (`success` | `failure` | `denied`).
3. **`audit_event`** — replaces `audit_log` and powers **org-wide Timeline** (replaces `/dashboard/activity`) plus **user Timeline** in settings; privileged viewers can open any member’s timeline.
4. **Role model** — **ADMIN** (platform), **OWNER** / **MANAGER** / **MEMBER** (org + project), aligned with Better Auth organization + teams + admin plugins.
5. **Project scope** — Better Auth is org/team-native; **project permissions are app tables** (`project_manager`, `project_team`, `project_member_grant`) evaluated after org role.

---

## 2. Current state (repo research)

### 2.1 Audit

| Area | Finding |
|------|---------|
| Table | `audit_log` (`packages/db/src/schema/audit.ts`) — `action`, `entityType`, FKs to project/env/variable, optional JSON in `oldValue`/`newValue`/`metadata` |
| Writer | `createAuditLog()` (`packages/api/src/audit.ts`) — swallows errors; only success paths in routers |
| Actions logged | Projects, environments, variables: mostly `CREATE`/`UPDATE`/`DELETE` + `BULK_IMPORT`/`EXPORT` |
| API | `auditLogs.list` / `stats` — **filter `userId = session.user`** only (`packages/api/src/routers/audit.ts`) |
| UI | `/dashboard/activity` — org-branded copy but **personal** log (`apps/web/src/domain/audit/*`) |

**Gaps:** no failure/denied events; no canonical action names; no org-wide view; no link to permissions or notifications.

### 2.2 Access control

| Area | Finding |
|------|---------|
| Org | `requireActiveOrganization`, `member.role` check (`packages/api/src/org-access.ts`) |
| Project | `projectListFilter` / `assertProjectAccess` — **creator `project.userId`** + `organizationId` match |
| Roles in UI | `owner`, `admin`, `member` (`organization-settings-client.tsx`) |
| Platform admin | **Not configured** — no `admin()` plugin; `user` table has **no `role` column** (`schema/auth.ts`) |
| Teams | Organization plugin **not** using `teams: { enabled: true }`; **no `team` tables** in `0004_organizations.sql` |

### 2.3 API surface (candidates for registry)

| Router | Procedures |
|--------|------------|
| `projects` | `list`, `get`, `getBySlug`, `create`, `update`, `delete`, `archive`, `changeStatus`, `togglePublic` |
| `environments` | `list`, `get`, `create`, `update`, `delete` |
| `environmentVariables` | `list`, `countsByEnvironment`, `get`, `create`, `update`, `delete`, `bulkImport`, `export` |
| `auditLogs` | `list`, `stats` |
| `notifications` | `unreadCount`, `list`, `markRead`, `markUnread`, `markAllRead`, sync helpers |
| `dashboard` | stats including audit aggregates |
| Better Auth (client) | org CRUD, members, invitations, (future) teams |

### 2.4 Notifications (cross-link)

`@env-manager/notifications` already uses typed events (`invitation.received`, `invitation.accepted`) with idempotency. Design: **high-signal actions** optionally emit notifications via registry `notifyOn?: NotificationType[]` keyed off successful `audit_event` (see §8).

---

## 3. Better Auth research (organization + admin)

### 3.1 Organization access control (built-in)

Better Auth ships `createAccessControl(defaultStatements)` with resources:

- `organization`: `update`, `delete`
- `member`: `create`, `update`, `delete`
- `invitation`: `create`, `cancel`
- `team`: `create`, `update`, `delete` (when teams enabled)
- `ac`: `create`, `read`, `update`, `delete` (dynamic custom roles)

Default roles (`statement.mjs`): **owner** (full org), **admin** (no org delete), **member** (read `ac` only).

Endpoints use internal `hasPermission({ permissions, role })`. Client: `authClient.organization.hasPermission({ permission: { invitation: ['create'] } })`.

**Dynamic access control:** org-scoped custom roles stored in DB (`createOrgRole`, `listOrgRoles`, …) — suitable for **future** per-org customization; v1 should use **static roles** generated from our registry with optional dynamic AC later.

### 3.2 Teams

Enable `organization({ teams: { enabled: true } })` → CRUD teams, add/remove team members, `setActiveTeam`. Teams are **org-scoped**, not project-scoped. **Project ↔ team** link is our `project_team` table.

### 3.3 Admin plugin (platform)

Separate plugin: `user` resource (`create`, `list`, `set-role`, `ban`, `impersonate`, …). Platform **ADMIN** = `user.role` in `adminRoles` (default `admin`) or `adminUserIds`. Requires `role` column on `user` (Better Auth schema).

**Naming collision:** Better Auth org role `admin` ≠ platform `admin`. This spec uses:

| Product role | Storage |
|--------------|---------|
| **ADMIN** (platform) | `user.role = 'admin'` (admin plugin) |
| **OWNER** | `member.role = 'owner'` |
| **MANAGER** | `member.role = 'manager'` (migrate from legacy `admin`) |
| **MEMBER** (org) | `member.role = 'member'` — team/project access only |

Org-level Better Auth `hasPermission` applies to **invitation/member/team/org** routes. **Project/env/variable** tRPC uses `requireAction` + project tables (§5).

### 3.4 Mapping registry → Better Auth

```ts
// Conceptual — generated from registry at build time
const orgAc = createAccessControl({
  organization: ["update", "delete"],
  member: ["create", "update", "delete", "list"],
  invitation: ["create", "cancel", "accept", "reject"],
  team: ["create", "update", "delete", "member_add", "member_remove"],
  timeline: ["view_org", "view_user"],
  project: ["create", "assign_manager", "assign_team"], // org-level project ops
});

const ownerRole = orgAc.newRole({ /* all org resources */ });
const managerRole = orgAc.newRole({
  member: ["list"],
  team: ["create", "update", "member_add", "member_remove"],
  project: ["assign_team"], // only on assigned projects enforced in app layer
  timeline: ["view_org"], // scoped to assigned projects in app layer
});
const orgMemberRole = orgAc.newRole({
  timeline: [], // own user timeline only via separate action
});
```

Registry entry example:

```ts
{
  name: "member.invite",
  scope: "organization",
  baPermission: { invitation: ["create"], member: ["create"] },
  audit: { entityType: "invitation", severity: "security" },
  notifyOn: ["invitation.received"],
}
```

---

## 4. Canonical action registry

### 4.1 Naming convention

`<resource>.<verb>` lowercase, dot-separated. Use specific verbs (`reveal` not `read` for secret material). Group by domain:

- `platform.*` — ADMIN only  
- `organization.*`, `member.*`, `invitation.*`, `team.*`  
- `project.*`, `environment.*`, `variable.*`  
- `audit.*`, `notification.*`  
- `settings.*`

### 4.2 Registry record shape (TypeScript)

```ts
export type ActionScope = "platform" | "organization" | "project";

export type ActionDefinition = {
  /** Stable id, e.g. variable.reveal */
  name: string;
  scope: ActionScope;
  description: string;

  /** Minimum org role if scope is organization or project (before project grant) */
  orgRoles?: Array<"owner" | "manager" | "member">;

  /** If true, MANAGER must have project_manager row; MEMBER must have grant */
  requiresProjectGrant?: boolean;

  /** Subset of grant keys for project members (see §6) */
  projectGrantKey?: string;

  /** Map to Better Auth hasPermission for org-scoped HTTP routes */
  baPermission?: Record<string, string[]>;

  /** Implied actions (read implied by update, etc.) */
  implies?: string[];

  audit: {
    entityType: string;
    /** Whether to capture request/response payloads in audit_event.payload */
    capturePayload?: "none" | "diff" | "metadata";
    severity?: "info" | "security" | "critical";
  };

  /** Notification types fired on success (existing @env-manager/notifications) */
  notifyOn?: string[];

  ui?: {
    label?: string;
    /** Sidebar or route id this gates */
    surface?: string;
  };
};

export const actionRegistry: Record<ActionName, ActionDefinition> = { ... };
```

**Codegen outputs (single package):**

- `actionNames` const array  
- `orgStatements` + `orgRoles` for Better Auth  
- `projectGrantKeys` union  
- Zod `actionNameSchema` for audit API filters  
- `ACTION_SIDEBAR_MAP` for nav (§7)

### 4.3 `requireAction` middleware

```ts
type RequireActionContext = {
  session: Session;
  organizationId?: string | null;
  projectId?: string | null;
  /** target user for timeline.view.user */
  targetUserId?: string;
  trpc: { path: string; type: "query" | "mutation" };
  requestMeta: { ip?: string; userAgent?: string };
};

async function requireAction(
  action: ActionName,
  ctx: RequireActionContext,
): Promise<{ allowed: true } | never> {
  const def = actionRegistry[action];
  const startedAt = Date.now();
  let result: "success" | "denied" | "failure" = "denied";
  let denialReason: string | undefined;

  try {
    if (await isActionBlocked(action, ctx)) {
      denialReason = "blocked";
      throw forbidden();
    }

    if (await isPlatformAdmin(ctx.session.user)) {
      result = "success";
      return { allowed: true };
    }

    const decision = await evaluateOrgAndProject(action, ctx);
    if (!decision.allowed) {
      denialReason = decision.reason;
      throw forbidden();
    }

    result = "success";
    return { allowed: true };
  } catch (e) {
    if (result !== "denied") result = "failure";
    throw e;
  } finally {
    await writeAuditEvent({
      action,
      result,
      denialReason,
      actorUserId: ctx.session.user.id,
      organizationId: ctx.organizationId,
      projectId: ctx.projectId,
      durationMs: Date.now() - startedAt,
      ...
    });
  }
}
```

**tRPC pattern:** wrap procedures with `actionProcedure("project.update")` that calls `requireAction` before handler; handler calls `auditEvent.markSuccess` with entity ids or rely on `finally` for denied/failure only — **success with entity detail** should be written in handler after mutation (or single write with `result` updated).

**Better Auth:** wrap sensitive org hooks / use BA’s internal checks aligned with `baPermission` on registry entries; still emit `audit_event` from hook for parity.

### 4.4 Evaluation order (deterministic)

1. **Block list** (`action_block`) — scope: `platform` \| `organization` \| `project` \| `user`  
2. **Platform ADMIN** — allow all except explicit platform blocks (e.g. compliance freeze)  
3. **Org context** — require active org when action scope needs it  
4. **Org OWNER** — all org actions + all projects in org  
5. **Org MANAGER** — org actions allowed by `manager` org role; project actions only if `project_manager` row exists for `projectId`  
6. **Project MEMBER** — user in team linked via `project_team` → `project_member_grant` must include `projectGrantKey`  
7. **Legacy owner** — during migration, `project.userId === actor` treated as OWNER-equivalent for that project until backfill completes  

Deny by default.

---

## 5. Role × responsibility matrix (behavioral)

| Capability | ADMIN | OWNER | MANAGER | MEMBER (project) |
|------------|:-----:|:-----:|:-------:|:----------------:|
| All orgs / all projects | ✓ | — | — | — |
| Org settings, billing (future) | ✓ | ✓ | — | — |
| Members & invitations | ✓ | ✓ | — | — |
| Teams CRUD | ✓ | ✓ | ✓ (org) | — |
| Assign manager to project | ✓ | ✓ | — | — |
| Assign team to project | ✓ | ✓ | ✓ (assigned project) | — |
| Project CRUD | ✓ | ✓ (all org) | ✓ (assigned) | grant |
| Env / variable CRUD | ✓ | ✓ | ✓ (assigned) | grant |
| Variable reveal (secret) | ✓ | ✓ | ✓ (assigned) | grant |
| Org timeline | ✓ | ✓ | ✓ (assigned projects filter) | — |
| Any user timeline | ✓ | ✓ | — | — |
| Own user timeline | ✓ | ✓ | ✓ | ✓ |
| Notifications | ✓ | ✓ | ✓ | ✓ (own) |

---

## 6. Full action × role matrix

Legend:

- **Y** — allowed (org role sufficient; project scope = all org projects for OWNER, assigned projects for MANAGER)  
- **G** — allowed only with **project grant** (MEMBER via team) or explicit `project_manager` row for MANAGER where noted  
- **—** — not allowed  
- **A** — ADMIN (platform) always **Y** unless block list says otherwise  

| Action | ADMIN | OWNER | MANAGER | MEMBER |
|--------|:-----:|:-----:|:-------:|:------:|
| `platform.user.list` | Y | — | — | — |
| `platform.user.set_role` | Y | — | — | — |
| `platform.user.impersonate` | Y | — | — | — |
| `organization.create` | Y | Y | — | — |
| `organization.update` | Y | Y | — | — |
| `organization.delete` | Y | Y | — | — |
| `organization.view` | Y | Y | Y | Y |
| `member.list` | Y | Y | Y | — |
| `member.invite` | Y | Y | — | — |
| `member.remove` | Y | Y | — | — |
| `member.role.update` | Y | Y | — | — |
| `invitation.accept` | Y | Y | Y | Y |
| `invitation.reject` | Y | Y | Y | Y |
| `invitation.cancel` | Y | Y | — | — |
| `team.create` | Y | Y | Y | — |
| `team.update` | Y | Y | Y | — |
| `team.delete` | Y | Y | Y | — |
| `team.member.add` | Y | Y | Y | — |
| `team.member.remove` | Y | Y | Y | — |
| `project.create` | Y | Y | — | — |
| `project.read` | Y | Y | G | G |
| `project.update` | Y | Y | G | G |
| `project.delete` | Y | Y | — | — |
| `project.archive` | Y | Y | G | — |
| `project.status.change` | Y | Y | G | — |
| `project.public.toggle` | Y | Y | G | — |
| `project.assign_manager` | Y | Y | — | — |
| `project.assign_team` | Y | Y | G | — |
| `project.permission.grant` | Y | Y | G | — |
| `environment.create` | Y | Y | G | G |
| `environment.read` | Y | Y | G | G |
| `environment.update` | Y | Y | G | G |
| `environment.delete` | Y | Y | G | — |
| `variable.create` | Y | Y | G | G |
| `variable.read` | Y | Y | G | G |
| `variable.update` | Y | Y | G | G |
| `variable.delete` | Y | Y | G | G |
| `variable.reveal` | Y | Y | G | G |
| `variable.bulk_import` | Y | Y | G | — |
| `variable.export` | Y | Y | G | G |
| `audit.timeline.view.org` | Y | Y | G | — |
| `audit.timeline.view.project` | Y | Y | G | G |
| `audit.timeline.view.user` | Y | Y | — | — |
| `audit.timeline.view.self` | Y | Y | Y | Y |
| `notification.list` | Y | Y | Y | Y |
| `notification.mark_read` | Y | Y | Y | Y |
| `settings.profile.view` | Y | Y | Y | Y |
| `settings.profile.update` | Y | Y | Y | Y |
| `settings.organization.view` | Y | Y | Y | — |

**MANAGER “G” rows:** requires row in `project_manager` for that `project_id`.  
**MEMBER “G” rows:** requires team membership for a team linked in `project_team` **and** grant bit in `project_member_grant`.

### 6.1 Default project member grant template

Managers assign grants as subsets of:

`project.read`, `environment.read`, `environment.create`, `environment.update`, `environment.delete`, `variable.read`, `variable.create`, `variable.update`, `variable.delete`, `variable.reveal`, `variable.export`

Default for new team on project: `project.read`, `environment.read`, `variable.read` (no reveal).

---

## 7. Client: `useCan`, `<Can>`, sidebar

### 7.1 Server-first permissions snapshot

tRPC `permissions.snapshot` (org + optional project):

```ts
{
  platformAdmin: boolean;
  orgRole: "owner" | "manager" | "member" | null;
  projectGrants: Record<ActionName, boolean>; // or grant keys
  blocked: ActionName[];
}
```

Cached in React Query; invalidated on org switch, project navigation, role/grant mutations.

### 7.2 `useCan(action, { projectId? })`

- Returns `{ allowed, reason, isLoading }`  
- Client-side mirror of server rules for **UI only** — never authoritative  
- Optional: call `authClient.organization.hasPermission` for org actions when BA client suffices

### 7.3 `<Can action="variable.create" projectId={id} fallback={null}>`

Render children only when allowed; use for buttons, menu items, sheets.

### 7.4 Sidebar config

```ts
export const platformNav = [
  { href: "/dashboard", label: "Dashboard", action: null },
  { href: "/dashboard/projects", label: "Projects", action: "project.read" },
  { href: "/dashboard/timeline", label: "Timeline", action: "audit.timeline.view.org" },
  { href: "/dashboard/notifications", label: "Notifications", action: "notification.list" },
  { href: "/dashboard/settings", label: "Settings", action: "settings.profile.view" },
] satisfies NavItem[];
```

Project sidebar (`sidebar-project-nav.ts`) adds `action: "project.read"` per project link. Hide item if `useCan` false.

**Route rename:** `/dashboard/activity` → `/dashboard/timeline` (redirect old URL).

---

## 8. Audit timeline & notifications

### 8.1 `audit_event` (replaces `audit_log`)

| Column | Type | Notes |
|--------|------|-------|
| `id` | text PK | |
| `action` | text | canonical name, indexed |
| `result` | text | `success` \| `failure` \| `denied` |
| `actor_user_id` | text FK | |
| `organization_id` | text FK nullable | |
| `project_id` | text FK nullable | |
| `environment_id` | text FK nullable | |
| `entity_type` | text | from registry |
| `entity_id` | text nullable | |
| `entity_slug` | text nullable | |
| `target_user_id` | text nullable | e.g. timeline viewed |
| `denial_reason` | text nullable | |
| `error_code` | text nullable | |
| `payload` | jsonb | diff/metadata; **no secret values** |
| `ip_address` | text | |
| `user_agent` | text | |
| `duration_ms` | int nullable | |
| `created_at` | timestamptz | |

Indexes: `(organization_id, created_at DESC)`, `(actor_user_id, created_at DESC)`, `(project_id, created_at DESC)`, `(action, created_at DESC)`.

**Migration:** backfill from `audit_log` mapping old enums → canonical names (§9).

### 8.2 UI surfaces

| Surface | Action gate | Data |
|---------|-------------|------|
| `/dashboard/timeline` | `audit.timeline.view.org` | Org-wide feed; MANAGER filtered to assigned projects |
| Settings → **Timeline** tab | `audit.timeline.view.self` | Actor = self |
| Settings → view another user (OWNER+) | `audit.timeline.view.user` | `targetUserId` param |

Reuses list component; filters by action, result, project, actor.

### 8.3 Notifications hook-in

| Step | Behavior |
|------|----------|
| Registry | `notifyOn: ['invitation.received']` on `member.invite` |
| On `audit_event` insert | If `result === 'success'` && action has `notifyOn`, call existing `notify()` with idempotency `audit:{audit_event.id}` |
| Future | `variable.updated` etc. |

Keeps notification types in `@env-manager/notifications`; registry only references type names.

---

## 9. Proposed migration tables (`0006_actions_permissions_audit`)

Joins **same approval bundle** as `0005` (user approves one prod cut) or immediately follows `0005` in journal — **single prod window**.

### 9.1 Auth / platform

```sql
-- Admin plugin role (if not present)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user' NOT NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banned" boolean DEFAULT false NOT NULL;
-- ban fields as required by better-auth admin plugin (see plugin schema)
```

### 9.2 Better Auth teams (organization plugin)

Use Better Auth’s generated team / team_member schema when enabling teams (run `db:generate` after plugin config) — typically:

- `team` (id, name, organization_id, …)  
- `team_member` (team_id, user_id, …)

### 9.3 App project access

```sql
CREATE TABLE project_manager (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  project_id text NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text REFERENCES "user"(id) ON DELETE SET NULL,
  UNIQUE (project_id, user_id)
);

CREATE TABLE project_team (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  project_id text NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  team_id text NOT NULL REFERENCES team(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text REFERENCES "user"(id) ON DELETE SET NULL,
  UNIQUE (project_id, team_id)
);

CREATE TABLE project_member_grant (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  project_id text NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  grants text[] NOT NULL DEFAULT '{}', -- canonical action names or grant keys
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text REFERENCES "user"(id) ON DELETE SET NULL,
  UNIQUE (project_id, user_id)
);

CREATE INDEX project_manager_user_idx ON project_manager (user_id);
CREATE INDEX project_member_grant_user_idx ON project_member_grant (user_id);
```

### 9.4 Action block list

```sql
CREATE TABLE action_block (
  id text PRIMARY KEY,
  action text NOT NULL, -- canonical name or '*' for all
  scope_type text NOT NULL, -- platform | organization | project | user
  scope_id text, -- null for platform-wide
  reason text,
  created_by text REFERENCES "user"(id) ON DELETE SET NULL,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX action_block_scope_idx ON action_block (scope_type, scope_id);
CREATE INDEX action_block_action_idx ON action_block (action);
```

### 9.5 Audit event + deprecate audit_log

```sql
CREATE TABLE audit_event (
  id text PRIMARY KEY,
  action text NOT NULL,
  result text NOT NULL,
  actor_user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  organization_id text REFERENCES organization(id) ON DELETE SET NULL,
  project_id text REFERENCES project(id) ON DELETE SET NULL,
  environment_id text REFERENCES environment(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id text,
  entity_slug text,
  target_user_id text REFERENCES "user"(id) ON DELETE SET NULL,
  denial_reason text,
  error_code text,
  payload jsonb NOT NULL DEFAULT '{}',
  ip_address text,
  user_agent text,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- indexes as §8.1

-- After backfill:
-- ALTER TABLE audit_log RENAME TO audit_log_legacy;
```

### 9.6 Data migration rules

| Data | Rule |
|------|------|
| `member.role = 'admin'` | Update to `'manager'` |
| `member.role = 'owner'` | Unchanged (OWNER) |
| Projects with `organization_id` set | OWNER = org owners; **no** `project_manager` rows initially |
| Projects without manager | **OWNER** manages all; MANAGER sees nothing until assigned |
| `project.user_id` | Remains creator attribution; access not limited to creator after org attach |
| `audit_log` rows | Map `CREATE`+`PROJECT` → `project.create`, etc.; `result = 'success'` |
| Platform admins | Manual seed `user.role = 'admin'` for operators |

### 9.7 Feature flags

```env
ACTIONS_AUDIT_ENABLED=true
NEXT_PUBLIC_ACTIONS_AUDIT_ENABLED=true
```

Gate registry, `requireAction`, and Timeline UI until migration applied.

---

## 10. Workstreams (parallel agents)

| ID | Workstream | Owns (paths) | Depends on |
|----|------------|--------------|------------|
| **W1** | Action registry package | `packages/actions/**` | — |
| **W2** | DB schema + SQL `0006` | `packages/db/src/schema/*`, `migrations/0006_*`, `docs/ACTIONS_*` | W1 action list frozen |
| **W3** | `requireAction` + audit writer | `packages/api/src/actions/**`, retrofit routers | W1, W2 |
| **W4** | Better Auth config | `packages/auth/**`, team enablement, admin plugin, org role migrate | W1, W2 |
| **W5** | Timeline UI | `apps/web/.../timeline/**`, remove/replace `activity/**`, settings tab | W3 list API |
| **W6** | Client `useCan` + sidebar | `apps/web/src/lib/nav/**`, `components/app-sidebar.tsx` | W3 snapshot endpoint |
| **W7** | Notifications bridge | `packages/notifications/**`, registry `notifyOn` | W3 audit insert hook |
| **W8** | E2E + backfill scripts | `apps/web/e2e/**`, `packages/db/scripts/**` | W3–W6 |

**Suggested order:** W1 → (W2 ∥ W4) → W3 → (W5 ∥ W6 ∥ W7) → W8.

**Do not merge** until user approves combined migration (0005 + 0006 bundle).

---

## 11. Open questions (for confirmation)

1. **Org `member` vs project MEMBER:** Should org-level `member` see any org timeline entries, or only after first team/project grant?  
2. **MANAGER invite:** Can managers invite users to org or only to teams? (Matrix assumes no.)  
3. **Variable reveal:** Always audit as `variable.reveal` even when failed — confirm retention period.  
4. **Block list precedence:** Platform block overrides ADMIN? (Recommended: yes for compliance.)  
5. **0005 + 0006:** One prod migration PR or two sequential with single flag flip?

---

## 12. References

- In-repo: `packages/api/src/audit.ts`, `packages/api/src/org-access.ts`, `packages/db/src/schema/audit.ts`  
- Better Auth: `plugins/organization/access/statement.mjs`, `plugins/organization/has-permission.mjs`, `plugins/admin/*`  
- Related: `docs/PLATFORM_MIGRATION_0005.md`, `docs/ORGANIZATION_MIGRATION.md`
