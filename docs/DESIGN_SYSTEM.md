# Design system (shadcn/ui)

Env Manager follows [shadcn/ui](https://ui.shadcn.com) defaults: semantic tokens (`border-border`, `bg-card`, `text-muted-foreground`), standard radius (`rounded-md`, `rounded-lg`), and the spacing scale (`gap-2` … `gap-6`, `p-4`, `md:p-6`).

## Layout primitives

| Component | Path | Use |
|-----------|------|-----|
| `PageContainer` | `apps/web/src/components/layout/page-container.tsx` | Page vertical rhythm (`gap-4 md:gap-6`), optional `max-w-2xl` (`size="narrow"`) |
| `PageSection` | `apps/web/src/components/layout/page-section.tsx` | Bordered scrollable body (`Card` + `CardContent` `p-4 md:p-6`) |
| `PageShell` | `apps/web/src/components/layout/page-shell.tsx` | `PageHeader` + `PageSection` (dashboard pages) |
| `FormSection` | `apps/web/src/components/layout/form-section.tsx` | Settings/forms: title, description, fields |
| `PageHeader` | `apps/web/src/components/patterns/page-header.tsx` | Title (`text-xl font-semibold`), description (`text-sm`) |

`DashboardSection` (`section-dashboard.tsx`) is a thin alias over `PageShell` for existing routes.

## Page chrome

- **Private app shell**: `Shell.Main` uses `p-4 md:p-6` and `gap-4 md:gap-6` (`shell.tsx`).
- **Sticky header**: `h-14`, `border-b`, `px-2 sm:px-4`, `gap-2` (`(private)/layout.tsx`).

## Spacing rules

1. Prefer `gap-4` and `gap-6` over one-off values (`gap-3`, `gap-5`, `gap-8`).
2. Card interiors: `p-4 md:p-6` (match `CardHeader` / `CardContent` defaults).
3. Form stacks: `space-y-4`.
4. Grids: `gap-4` (stats, project cards).
5. Do not use arbitrary spacing (`p-[…]`, `mt-7`) in app code; `components/ui/*` may keep library internals.

## Borders and radius

- Surfaces: `border` + `rounded-lg` (cards) or `rounded-md` (inputs, buttons).
- No custom border colors except semantic (`border-destructive/40` in danger zones).

## Skeletons

- Match loaded layout size (`DashboardPageSkeleton` mirrors welcome + stat cards).
- Use `Skeleton` from `@/components/ui/skeleton` only.

## Empty and error states

- `EmptyState` uses shadcn `Empty` with `border border-dashed`.
- `ErrorState` stays centered in the content area.

## Surfaces covered

- **Shell**: private header, sidebar (groups, separators, org switcher), breadcrumbs, `Shell.Main`
- **Dashboard**: stats, activity, skeletons
- **Projects**: list accordion, cards, create/edit forms, detail about card, environments tabs, variables table + mobile cards, dialogs
- **Settings**: account page + skeleton, organization settings
- **Marketing**: home hero/features (spacing + default cards)
- **System**: 404, error states, empty states, submit buttons

## E2E layout checks

Playwright (`apps/web/e2e/`):

- Public overflow: `responsive-overflow.spec.ts`, `layout-screenshots.spec.ts` (375 / 768 / 1280)
- Authenticated routes: `authenticated-layout.spec.ts` — requires `E2E_SESSION_COOKIE` (`name=value` pairs, e.g. Better Auth session cookie) in CI or locally; tests skip when unset

CLS guard: `assertStableMainHeight` on `#main-content` after load.

## Audit notes

Arbitrary spacing/color overrides were removed from app/domain code. Do not add `p-[…]`, `gap-3`/`gap-5`/`gap-8`, `text-red-500`, or `bg-input/30` on product cards—use tokens and `gap-4`/`gap-6`. `components/ui/*` stays as shadcn-generated.

**Not unified (intentional):**

- Radix-driven widths (`--radix-dropdown-menu-trigger-width`, select trigger height) in org switcher and shadcn selects
- `touchTarget` / `size-11` on coarse-pointer controls (accessibility)
- Marketing typography scale (`text-5xl` hero) on the public landing page
- Status indicator dots on project list categories (semantic colors)
- `HorizontalScrollRail` fade edges (`w-6` gradients) for tab overflow
