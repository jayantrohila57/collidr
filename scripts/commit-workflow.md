# Commit workflow (env-manager)

This repository ships from **`main`** only. Every change should reference a GitHub issue.

## Standard workflow

### 1. Issue

Create or pick an issue on [jayantrohila57/env-manager](https://github.com/jayantrohila57/env-manager/issues).

### 2. Implement on `main`

```bash
git checkout main
git pull --rebase origin main
# … make changes …
```

### 3. Commit

Use a clear subject line; footer **`Fixes #<issue>`** when the issue is complete.

```bash
git add -A
git commit -m "docs: update platform plan for SSO subdomains

Fixes #41"
```

Conventional types (`feat`, `fix`, `docs`, `chore`, …) are encouraged but not required.

### 4. Push (deploy)

```bash
git pull --rebase origin main
git push origin main
```

Production Vercel deploys from this push. **No** preview deployments from feature branches.

Before pushing risky releases, follow [docs/PRODUCTION_DEPLOY.md](../docs/PRODUCTION_DEPLOY.md) (batch commits, `NEXT_PUBLIC_*` redeploy, `pnpm turbo run build --filter=web`).

## Rules

| Do | Don't |
|----|--------|
| `git pull --rebase` before push | `git push --force` |
| `Fixes #N` on completing issues | `git commit --amend` after push to shared `main` |
| Work tracked in GitHub issues | Drive-by commits without an issue |
| Test `pnpm build` / `pnpm check-types` for risky changes | Skip UI smoke test after visual changes |

## Releases (optional)

Version bumps use [CHANGELOG.md](../CHANGELOG.md) and `pnpm run release:*` — see [scripts/README.md](./README.md). Releases still land on **`main`**.

## Pre-commit checklist

- [ ] Linked GitHub issue exists
- [ ] `pnpm check-types` / `pnpm build` when touching API or types
- [ ] UI verified in browser when touching `apps/web`
- [ ] Docs updated when behavior or flags change
- [ ] No secrets in the diff

## Historical note

Older versions of this guide described feature branches and `git commit --amend` / force-push recovery. **That does not apply to this repo’s main-only deploy model.**
