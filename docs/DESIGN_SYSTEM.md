# Design system (shadcn/ui)

Env Manager follows [shadcn/ui](https://ui.shadcn.com) with preset **`b2CjxkLnk`** ([create link](https://ui.shadcn.com/create?preset=b2CjxkLnk&base=radix&pointer=true&rtl=true)): semantic tokens, compact **radix-mira** sizing, and a single app padding scale.

## Preset `b2CjxkLnk` (applied via CLI)

Command (from `apps/web`):

```bash
pnpm dlx shadcn@latest apply b2CjxkLnk -y
```

### What the preset configures

| Setting | Value | Notes |
|--------|--------|--------|
| **Style** | `radix-mira` | Compact controls (`h-7` buttons/inputs), `text-xs/relaxed`, ring-based focus, `radix-ui` unified package |
| **Base** | Radix (not Base UI) | Matches `base=radix` on the create URL |
| **Base color / theme** | `mist` | Cool gray neutrals; **primary** teal-green (`oklch` ~165° hue); full light/dark OKLCH tokens in `apps/web/src/index.css` |
| **Radius** | `--radius: 0.625rem` (10px) | Derived `radius-sm` … `radius-4xl` in `@theme` |
| **Fonts** | **Instrument Sans** → `--font-sans` | Wired in `apps/web/src/app/layout.tsx` (`next/font/google`); `html` uses `font-sans` |
| **Icons** | `lucide` | Unchanged |
| **Menu** | `menuColor: default`, `menuAccent: subtle` | Sidebar/menu accent behavior in generated sidebar styles |
| **Pointer** | `pointer=true` (create URL) | Interactive affordance: `cursor-pointer` on `Button` (preset did not add it to every primitive; we align `Button` with the create option) |
| **RTL** | `rtl=true` (create URL) | `components.json` → `"rtl": true`; app wrapped in `DirectionProvider` (`dir="ltr"` today); **app code** uses logical utilities (`ms`/`me`/`ps`/`pe`/`start`/`end`, `text-start`/`text-end`) |
| **CSS pipeline** | Tailwind v4 | `@import "shadcn/tailwind.css"`, `@import "tw-animate-css"`, CSS variables in `src/index.css` |
| **Utils** | `cn` from `cn` package | `apps/web/src/lib/utils.ts` re-exports `cn` and keeps app helpers (`touchTarget`, slug utils) |

### Regenerated / updated artifacts

The apply step rewrote **all installed shadcn components** under `apps/web/src/components/ui/` (54 modules), plus:

- `apps/web/components.json`
- `apps/web/src/index.css` (theme tokens)
- `apps/web/src/lib/utils.ts` (preset `cn`; app helpers restored)
- `apps/web/src/hooks/use-mobile.tsx` (breakpoint kept at **1024** for lg sidebar sheet)
- `apps/web/package.json` / lockfile (`radix-ui`, `shadcn`, `cn`, etc.)
- New: `apps/web/src/components/ui/direction.tsx` (`DirectionProvider`)

CLI leaves `rtl: false` in `components.json` even when the create URL has `rtl=true`; we set **`rtl: true`** to match the preset URL and future `shadcn add` output.

### Post-apply merges (product rules)

These are **intentional** overrides on top of stock preset output:

1. **Sidebar breakpoint**: desktop sidebar at **`lg` (1024px)**; mobile sheet below that (`useIsMobile` breakpoint 1024).
2. **Flat main canvas**: `SidebarInset` has **no** inset `m-2` / rounded shell (flat page background; no card-in-card).
3. **Design doc rules** below (padding, skeletons, surfaces).

## Layout primitives

| Component | Path | Use |
|-----------|------|-----|
| `PageContainer` | `apps/web/src/components/layout/page-container.tsx` | Page vertical rhythm (`gap-4 md:gap-6`), optional `max-w-2xl` (`size="narrow"`) |
| `PageSection` | `apps/web/src/components/layout/page-section.tsx` | Plain content region below header (**no** card wrapper) |
| `PageShell` | `apps/web/src/components/layout/page-shell.tsx` | `PageHeader` + `PageSection` (dashboard pages) |
| `FormSection` | `apps/web/src/components/layout/form-section.tsx` | Settings/forms: title, description, fields |
| `PageHeader` | `apps/web/src/components/patterns/page-header.tsx` | Title (`text-xl font-semibold`), description (`text-sm`) |

`DashboardSection` (`section-dashboard.tsx`) is a thin alias over `PageShell` for existing routes.

## Page chrome

- **Private app shell**: `SidebarInset` uses **`p-4`** only for page padding (`(private)/layout.tsx`). Do not stack extra section padding on dashboard pages.
- **Sticky header**: `h-14`, `border-b`, `px-2 sm:px-4`, `gap-2` (`(private)/layout.tsx`).

## Spacing rules

1. Prefer `gap-4` and `gap-6` over one-off values (`gap-3`, `gap-5`, `gap-8`).
2. Card interiors (leaf cards only): `p-4 md:p-6` where a real `Card` is used.
3. Form stacks: `space-y-4`.
4. Grids: `gap-4` (stats, project cards).
5. Do not use arbitrary spacing (`p-[…]`, `mt-7`) in app code; `components/ui/*` may keep library internals.

## Surfaces (strict)

- **No card-in-card**: page background stays flat; use `PageSection` / `DashboardSection` without wrapping lists in an extra `Card`.
- **Cards** only for leaf content (welcome panel, project cards, About, environment blocks, marketing feature cards, etc.).

## Borders and radius

- Surfaces: `border` + `rounded-lg` (cards) or preset compact `rounded-md` (inputs, buttons).
- No custom border colors except semantic (`border-destructive/40` in danger zones).

## Skeletons

- Match loaded layout size (`DashboardPageSkeleton`, project detail skeleton 1:1).
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
- Authenticated routes: `authenticated-layout.spec.ts` — requires `E2E_SESSION_COOKIE` in CI or locally; tests skip when unset

CLS guard: `assertStableMainHeight` on `#main-content` after load.

## Audit notes

Arbitrary spacing/color overrides were removed from app/domain code. Do not add `p-[…]`, `gap-3`/`gap-5`/`gap-8`, `text-red-500`, or `bg-input/30` on product cards—use tokens and `gap-4`/`gap-6`. `components/ui/*` stays as shadcn-generated except documented merges above.

**Not unified (intentional):**

- Radix-driven widths (`--radix-dropdown-menu-trigger-width`, select trigger height) in org switcher and shadcn selects
- `touchTarget` / `size-11` on coarse-pointer controls (accessibility)
- Marketing typography scale (`text-5xl` hero) on the public landing page
- Status indicator dots on project list categories (semantic colors)
- `HorizontalScrollRail` fade edges (`w-6` gradients) for tab overflow
