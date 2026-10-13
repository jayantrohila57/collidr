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

## Layout primitives (app-level, unchanged)

| Component | Path |
|-----------|------|
| `PageContainer` | `apps/web/src/components/layout/page-container.tsx` |
| `PageSection` | `apps/web/src/components/layout/page-section.tsx` |
| `PageShell` | `apps/web/src/components/layout/page-shell.tsx` |
| `FormSection` | `apps/web/src/components/layout/form-section.tsx` |
| `PageHeader` | `apps/web/src/components/patterns/page-header.tsx` |

Use coss defaults for control density and visuals—avoid custom overrides on generated `ui/*` primitives.

## Charts

Dashboard charts use `apps/web/src/components/ui/chart.tsx` (Recharts wrapper). This is not part of coss ui; keep it free of Radix.

## Verification

```bash
cd apps/web
rg -n 'radix-ui|@radix-ui' --glob '!node_modules'   # expect no matches
pnpm build
pnpm a11y
```
