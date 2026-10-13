# UI & Architecture Requirements

## Purpose

This document defines **non-negotiable rules** for UI, component architecture, data flow, and page structure.
Every new feature, page, hook, or component **must comply** with this document.

**Spacing, coss ui primitives, layout tokens, and shadcn composition** are specified in [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md). That file is the **single source of truth** for gutters, `PageHeaderBar`, `FormSheet`, icons, and `components/ui/*` usage. This document covers **domain structure and data flow** only.

**After any UI change:** run `pnpm dev:web` and verify the affected routes in the browser (loading, empty, error, and success states).

---

## 1. Folder & Domain Structure

### 1.1 Source Layout

```
src/
  domains/
    <domain-name>/
      components/
        server/
        client/
          skeletons/
      hooks/
      api/
      constants/
      types/
      utils/
  app/
  config/
  lib/
  components/ui/   (DO NOT MODIFY — coss/shadcn generated)
```

### 1.2 Domain Rules

* Every feature **must belong to exactly one domain**
* Cross-domain imports are **not allowed**, except:

  * `config`
  * `lib`
  * `ui`
* No shared “utils” dumping ground outside domains

---

## 2. Server vs Client Components

### 2.1 Pages

* **ALL pages must be Server Components**
* **ALL pages must be async**
* Pages:

  * Do not fetch UI data directly
  * Only orchestrate rendering
  * Handle metadata
  * Handle route protection

### 2.2 Client Components

* Client components **must be leaf nodes**
* Client components:

  * Never import server components
  * Never contain business logic
  * Never fetch data directly
* Client components **must be dynamically imported**
* Client components **must support Suspense skeletons**

### 2.3 Separation Rules

* Static / server-renderable parts stay in server components
* Interactive logic lives in hooks
* Rendering-only logic lives in components

---

## 3. Page Rendering Pattern (Mandatory)

### Required Flow

```
page.tsx (server)
  └── dynamic import client component
        └── Suspense + Skeleton
              └── Client Component
                    └── Hook (logic + api)
                          └── API layer
```

### Example Lifecycle

1. Page validates auth and metadata
2. Page dynamically imports client component
3. Suspense fallback renders skeleton
4. Client component calls hook
5. Hook resolves data and logic
6. Component renders props only

---

## 4. Hooks & Logic

### 4.1 Hook Rules

* **ALL logic must live in hooks**
* Hooks handle:

  * State
  * API calls
  * Data transformation
  * Error handling
* Hooks return **final computed data only**

### 4.2 Component Rules

* Components:

  * Receive only final props
  * Do not mutate data
  * Do not call APIs
  * Do not store logic
  * Do not handle conditions

---

## 5. API Hooks Pattern

### 5.1 Standard API State Machine

Every API hook **must expose a unified state**:

* loading
* success
* empty
* error

### 5.2 Mandatory Switch Handling

All API-driven components **must explicitly handle**:

* Loading state
* Error state
* No-data state
* Success state

No implicit rendering.
No silent failures.

---

## 6. Dynamic Imports & Code Splitting

* Every client component:

  * Must be dynamically imported
  * Must be wrapped in Suspense
* Skeleton components:

  * Must match final layout
  * Must use identical spacing and structure

---

## 7. Reusability & Patterns

### 7.1 Component Design

All components must follow:

* Composition pattern
* Compound component pattern (similar to shadcn/ui)

### 7.2 Singleton Responsibility

* One component = one responsibility
* No duplicate implementations across domains

---

## 8. Styling & UI Consistency

### 8.1 UI Constraints

* **DO NOT modify `apps/web/src/components/ui/`** except via the documented shadcn/coss CLI workflow
* Use only coss/shadcn variants and tokens from [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) (`layout-spacing.ts`, `PageStack`, `FormSheet`, etc.)

### 8.2 Spacing Rules

* No arbitrary spacing (`p-4`, `gap-6`, …) in feature code — import layout tokens
* Sidebar-scale gutters (`p-2`, `gap-2`, `h-8` / `h-12` chrome) everywhere in app shell and pages

---

## 9. Route Protection

* Every page must:

  * Enforce authentication at the server level
  * Never rely on client-only protection
* Unauthorized access must be handled before rendering

---

## 10. Metadata

* Every page must define metadata
* Metadata must:

  * Reference site config values
  * Be colocated with the page

---

## 11. Enforcement Rules

### 11.1 Forbidden

* Logic inside components
* API calls inside components
* Client components importing server logic
* Mixed concerns
* Inline conditional rendering for business logic
* Shared helper chaos

### 11.2 Mandatory Checklist

Before writing any code:

1. Read this document
2. Choose the domain
3. Define server vs client boundary
4. Define hook contract
5. Define skeleton layout

---

## 12. Rule Priority

When in doubt, follow this order:

1. Server over client
2. Hook over component
3. Composition over inheritance
4. Consistency over convenience

---