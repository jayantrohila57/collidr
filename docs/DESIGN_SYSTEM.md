# Design system (coss ui)

Env Manager uses [coss ui](https://coss.com/ui) on [Base UI](https://base-ui.com/) via the shadcn registry (`@coss/*`). Components live under `apps/web/src/components/ui/` as copied source (not Radix).

## Stack

| Layer | Choice |
|--------|--------|
| Primitives | coss ui (`pnpm dlx shadcn@latest add @coss/style` / `@coss/ui`) |
| Registry | `@coss` → `https://coss.com/ui/r/{name}.json` in `apps/web/components.json` |
| Styling | Default coss **neutral** tokens from `@coss/style` in `apps/web/src/index.css` |
| Fonts | **Inter** (`--font-sans`, `--font-heading`) + **Geist Mono** (`--font-mono`) via `next/font/google` in `apps/web/src/app/layout.tsx` |
| Icons | Lucide (`lucide-react`) |
| Toasts | coss `ToastProvider` + `toastManager` (wrapper: `apps/web/src/lib/toast.ts`) |
| Dark mode | `next-themes` + semantic CSS variables |
| RTL | `DirectionProvider` (`@base-ui/react/direction-provider`); logical utilities in app code |

## Setup commands (reference)

From `apps/web`:

```bash
pnpm dlx shadcn@latest add @coss/style
# or: add @coss/ui and @coss/colors-neutral for incremental adoption
```

Base UI layout: root `body` is `relative`; app content is wrapped in `isolate relative flex min-h-svh flex-col` (see `src/app/layout.tsx`).

## Composition API (vs Radix)

| Old (Radix/shadcn) | coss / Base UI |
|--------------------|----------------|
| `asChild` | `render={<Button />}` / `render={<Link href="..." />}` |
| `DropdownMenu*` | `Menu`, `MenuTrigger`, `MenuPopup`, `MenuItem`, `MenuLinkItem` |
| `HoverCard*` | `PreviewCard`, `PreviewCardTrigger`, `PreviewCardPopup` |
| `DialogContent` | `DialogPopup` (+ optional `DialogPanel`) |
| `TooltipContent` | `TooltipPopup` |
| `TabsContent` | `TabsPanel` |
| `CollapsibleContent` | `CollapsiblePanel` |

See `docs/COSS_MIGRATION.md` for the full migration map.

## Spacing (sidebar scale)

All app layout spacing is derived from the coss **Sidebar** source (`apps/web/src/components/ui/sidebar.tsx`). Do not invent parallel gutters (`p-4`, `gap-6`, `md:p-6`, etc.) in feature code—import tokens or layout primitives instead.

| Sidebar source | Token | Tailwind |
|----------------|-------|----------|
| `SidebarHeader`, `SidebarFooter`, `SidebarGroup` | `layoutGutterClass` | `p-2` |
| `SidebarContent` column | `layoutGapClass` | `gap-2` |
| `SidebarMenu` | `layoutMenuGapClass` | `gap-1` |
| `SidebarMenuButton` (default) | `layoutRowClass` | `h-8` |
| `SidebarMenuButton` `size="lg"` (team switcher) | `layoutRowLgClass` | `h-12` |
| `SidebarGroupLabel` | `layoutGroupLabelClass` | `h-8`, `px-2`, `text-xs` |

**Tokens:** `apps/web/src/lib/layout-spacing.ts`

**Composed primitives** (no new visuals—only class composition):

| Primitive | Path | Use |
|-----------|------|-----|
| `PageMain` | `components/layout/app-layout.tsx` | Dashboard main scroll area (`layoutContentClass`) |
| `PageStack` | same | Vertical sections (`gap-2`) |
| `PageHeaderBar` / `PageHeaderRow` | same | Sticky inset header; **same `p-2` + `h-12` row as `SidebarHeader` + team switcher** |
| `PageTitleRow` | same | In-page title + action (`text-sm` title) |
| `PageToolbar` | same | Filters / search above tables |
| `layoutSheetPanelClass` | `layout-spacing.ts` | Sheet bodies (`SheetPanel` `className`) |
| `DashboardSection` | `components/section-dashboard.tsx` | Wraps `PageStack` + `PageTitleRow` |
| `FormSection` | `components/layout/form-section.tsx` | Form blocks (`gap-2`) |

`Shell.Main` `variant="dashboard"` uses `layoutContentClass`. The private layout `PageHeaderBar` aligns with the sidebar org switcher row.

Card, Frame, Table, and Dialog **internals** keep coss defaults (`p-6` on `CardHeader`, etc.); only **between** sections and **app chrome** use the sidebar scale.

## Layout primitives (coss)

| Component | Path |
|-----------|------|
| `Frame` (page/section layout) | `apps/web/src/components/ui/frame.tsx` |
| `Sidebar*` | `apps/web/src/components/ui/sidebar.tsx` |

Use coss defaults for control density and visuals—avoid custom overrides on generated `ui/*` primitives except where `layout-spacing` documents app-level composition.

## Charts

Dashboard charts use `apps/web/src/components/ui/chart.tsx` (Recharts wrapper). This is not part of coss ui; keep it free of Radix.

## Verification

```bash
cd apps/web
rg -n 'radix-ui|@radix-ui' --glob '!node_modules'   # expect no matches
pnpm build
pnpm a11y
```
