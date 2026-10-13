# Environment Manager — project summary

**Last updated:** October 2026 · **Version:** 1.8.0 (see root `package.json`)

## Overview

Secure, organization-aware dashboard for managing environment variables across projects and environments. AES-256-GCM encryption at rest, GitHub OAuth, and a **canonical actions** layer for permissions and audit.

## Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js, React, TypeScript, coss ui (Base UI) |
| API | tRPC, TanStack Query |
| Auth | Better Auth — GitHub, organizations, teams |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Monorepo | pnpm workspaces + Turborepo |
| Deploy | Vercel — **`main` only** → `collidr-web.vercel.app` |

## Monorepo packages

- **`apps/web`** — product UI
- **`packages/api`** — tRPC
- **`packages/actions`** — action registry & role evaluation
- **`packages/auth`**, **`packages/db`**, **`packages/crypto`**, **`packages/env`**, **`packages/notifications`**, **`packages/config`**

## Implemented capabilities

- Projects, environments, variables (import/export, variables v2 types behind flag)
- Organizations module: members, teams, invitations, roles, settings, org timeline
- Account settings: profile, sessions, linked accounts, export, delete, personal timeline
- Per-project managers, team links, member CRUD grants
- Notifications center (flagged)
- Audit timeline via `audit_event` (flagged)
- Soft deletes on core entities (flagged)
- Onboarding for users without org membership

## Role model

| Role | Scope |
|------|--------|
| **Owner** | Full org control; timeline visibility for all members |
| **Manager** | Org operations + project access per grants |
| **Member** | Project access via explicit grants |
| **Admin** (platform) | Reserved — future `apps/console`; not enabled in web today |

Legacy Better Auth `admin` org role is normalized to **Manager** in `@collidr/actions`.

## Workflow

- Tasks and bugs → **GitHub issues** on collidr; commits **`Fixes #N`**
- Agents: see [AGENTS.md](./AGENTS.md)
- UI rules: [UI.md](./UI.md) + [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md)

## Platform roadmap

- Multi-app hosting on separate `*.vercel.app` subdomains; SSO via future **auth-app** OIDC redirects — [docs/PLAN_PLATFORM_APPS.md](./docs/PLAN_PLATFORM_APPS.md) §14
- MCP + operator console — [docs/PLAN_MCP_AND_CONSOLE.md](./docs/PLAN_MCP_AND_CONSOLE.md)

## Database operations

- Day-to-day: `pnpm db:push` per [packages/db/DATABASE.md](./packages/db/DATABASE.md)
- Prod schema cut + optional demo seed: [docs/PLATFORM_MIGRATION_COMBINED.md](./docs/PLATFORM_MIGRATION_COMBINED.md), [docs/DB_RESET.md](./docs/DB_RESET.md)
