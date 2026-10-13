# UI redesign (coss ui)

**Status:** Largely implemented. For day-to-day rules use [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) and [UI.md](../UI.md).

Senior UI/UX pass aligned with Vercel, Linear, Supabase, and Clerk: dense sidebar-scale spacing, one primary CTA per view, and coss primitives only.

**Spacing:** `apps/web/src/lib/layout-spacing.ts` (mirrors inset `Sidebar` — `p-2`, `gap-2`, `h-8` / `h-12` chrome).

**Chrome:** Inset `Sidebar` (`collapsible="icon"`, `variant="inset"`) + `OrgSwitcher` in `SidebarHeader`. Sticky `PageHeaderBar` matches sidebar header row.

**Tables:** `DataTable` (coss `Table` + TanStack) with toolbar, pagination, empty, skeleton.

**Forms:** Inset `Sheet` for create/edit; `AlertDialog` for destructive actions; `toast` for feedback.

---

## Landing / sign-in (`/`)

| | |
|---|---|
| **User goal** | Understand the product and sign in with one obvious action. |
| **Primary action** | Sign in with GitHub (or go to dashboard if already signed in). |
| **Hierarchy** | Value prop → single CTA → feature grid → footer CTA. |
| **Components** | `Shell`, `Frame` / `FramePanel`, `Card`, `Badge`, `Button`, `GitHubLoginButton`. |

Dense marketing typography (`text-3xl`–`4xl` hero), `h-12` public header, no oversized hero cards.

---

## Onboarding / create org (`/dashboard/onboarding`)

| | |
|---|---|
| **User goal** | Create the first workspace without distraction. |
| **Primary action** | Continue (create organization). |
| **Hierarchy** | Page context → inset sheet form (name, slug). |
| **Components** | `Frame`, `PageTitleRow`, inset `Sheet`, `Input`, `SubmitButton`. |

Full-viewport `Frame` backdrop; blocking inset sheet (no close) keeps focus on the task.

---

## Dashboard (`/dashboard`)

| | |
|---|---|
| **User goal** | See workspace health and open a project quickly. |
| **Primary action** | New project. |
| **Hierarchy** | Title + CTA → inline stats → projects `DataTable`. |
| **Components** | `PageStack`, `PageTitleRow`, `DataTable`, `Empty`, `CreateProjectSheet`. |

No hero cards; stats are a single compact row above the framed table.

---

## Projects list (`/dashboard/projects`)

| | |
|---|---|
| **User goal** | Browse and create projects. |
| **Primary action** | New project. |
| **Hierarchy** | Title + description + CTA → searchable paginated `DataTable`. |
| **Components** | `DashboardSection`, `DataTable`, `CreateProjectSheet`, `Empty`. |

Same table pattern as dashboard (removed category collapsibles for one scannable list).

---

## Project detail (`/dashboard/projects/[slug]`)

| | |
|---|---|
| **User goal** | Read overview, switch environments, manage variables. |
| **Primary action** | Add environment / add variable (contextual). |
| **Hierarchy** | Page title (badges) → overview `Card` → metadata `Card` → environments `Card` with `Tabs` → settings → danger zone. |
| **Components** | `Card`, `TabsList` / `TabsTab` / `TabsPanel`, `Badge`, `DataTable`, inset sheets, `AlertDialog`. |

Environment tabs: compact `sm` tabs, count badges, `?env=` URL; panel = toolbar + variables table only.

---

## Project settings (`/dashboard/projects/[slug]/edit`)

| | |
|---|---|
| **User goal** | Edit project fields safely. |
| **Primary action** | Save changes (sheet or form submit). |
| **Hierarchy** | `DashboardSection` → `Card` / form fields. |
| **Components** | `EditProjectSheet`, `Card`, `Input`, `SubmitButton`. |

Matches project detail density; edit entry via sheet from overview CTA.

---

## Organization settings (`/dashboard/settings/organization`)

| | |
|---|---|
| **User goal** | Manage workspace profile, members, and destructive actions. |
| **Primary action** | Edit org / invite member (tab-specific). |
| **Hierarchy** | Page title → `Tabs` (General, Members, Danger zone) → `Card` + `DataTable` in members. |
| **Components** | `Tabs`, `Card`, `DataTable`, inset `Sheet` (edit, invite), `AlertDialog` (delete). |

Tab state in URL `?tab=general|members|danger`.

---

## User settings (`/dashboard/settings`)

| | |
|---|---|
| **User goal** | View account and jump to org settings. |
| **Primary action** | Link to organization settings (when enabled). |
| **Hierarchy** | Title → stacked `Card` sections in `Frame`. |
| **Components** | `Card`, `Avatar`, skeleton matching cards. |

---

## Activity (`/dashboard/activity`)

| | |
|---|---|
| **User goal** | Audit changes across projects. |
| **Primary action** | Filter/search logs. |
| **Hierarchy** | Section title → `DataTable` toolbar (search + project filter). |
| **Components** | `DataTable`, `Select`, `Badge`. |

---

## 404 / error / loading

| | |
|---|---|
| **User goal** | Recover orientation or retry. |
| **Primary action** | Go home / open dashboard / retry. |
| **Hierarchy** | Centered `Frame` + `Empty` or `ErrorState`. |
| **Components** | `PageStatusShell`, `Empty`, `ErrorState`, `Button`; route `loading.tsx` uses `PageStack` + skeletons matching final layout. |

---

## Responsiveness & accessibility

- Verified at **1280**, **768**, and **375** via Playwright (`e2e/layout-screenshots.spec.ts`, `e2e/spacing-audit.spec.ts`, `e2e/responsive-overflow.spec.ts`, `e2e/a11y.spec.ts`).
- Focus rings on interactive controls; tables expose captions; icon buttons have `aria-label`.

---

## Screenshots

After deploy, see `apps/web/e2e/redesign-screenshots.spec.ts` output under `redesign-shots/` (and CI artifacts). Baseline before this pass: git tag `pre-redesign-ui` at parent of first redesign commit on `main`.
