# MCP server deploy (`apps/mcp`)

Remote MCP (HTTP `POST /api/mcp`, MCP 2026-07-28) on Vercel project **`env-manager-mcp`** (`mcp-env-manager.vercel.app`). OAuth issuer and consent live on **`apps/auth`**.

## Migrations (before production)

1. Neon backup branch.
2. Apply reviewed SQL in order:
   - `packages/db/src/migrations/0008_platform_admin.sql` (if not already applied)
   - `packages/db/src/migrations/0009_platform_apps.sql` (OAuth/MCP + `rate_limit_bucket`)
3. Do **not** enable MCP in auth until `0009` is applied.

## Vercel: `env-manager-mcp`

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | yes | Same Neon DB as auth/studio |
| `DATABASE_URL_POOLED` | recommended | Neon pooler |
| `BETTER_AUTH_SECRET` | yes | Same value as auth app |
| `BETTER_AUTH_URL` | yes | Auth issuer origin, e.g. `https://auth-env-manager.vercel.app` |
| `MCP_RESOURCE_URL` | yes | Canonical resource, e.g. `https://mcp-env-manager.vercel.app/api/mcp` |
| `NEXT_PUBLIC_AUTH_URL` | yes | Auth origin (build-time link graph) |
| `NEXT_PUBLIC_MCP_URL` | yes | MCP app origin without path |
| `MCP_RATE_LIMIT_WINDOW_MS` | optional | Default `60000` |
| `MCP_RATE_LIMIT_MAX_REQUESTS` | optional | Default `120` |
| `MCP_RATE_LIMIT_MAX_WRITE` | optional | Default `60` (mutations per window) |
| `MCP_RATE_LIMIT_MAX_REVEAL` | optional | Default `30` (`variable.reveal` / export) |
| `SKIP_ENV_VALIDATION` | build only | `1` for CI/build without secrets |

Shared platform flags (`ORGANIZATIONS_ENABLED`, `ACTIONS_AUDIT_ENABLED`, etc.) match studio when MCP tools call `@env-manager/api`.

## Vercel: `env-manager-auth` (MCP issuer)

| Variable | Required | Notes |
|----------|----------|--------|
| `PLATFORM_AUTH_ENABLE_MCP` | yes | `1` to load MCP + CIMD + DCR plugins |
| `MCP_RESOURCE_URL` | yes | Must match MCP `POST` URL (same as mcp project) |
| `NEXT_PUBLIC_MCP_URL` | yes | MCP app origin for discovery links |

All other auth env vars unchanged (GitHub OAuth, `BETTER_AUTH_URL`, shared DB).

## Local

```bash
pnpm dev:auth   # port 3000 — set PLATFORM_AUTH_ENABLE_MCP=1
pnpm dev:mcp    # port 3004
```

Resource URL for local: `http://localhost:3004/api/mcp` (loopback HTTP allowed by Better Auth MCP).
