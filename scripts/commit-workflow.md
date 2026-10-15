# Commit workflow (loftlancer)

Production ships from **`main`**. Integration happens on **`dev`**. Every change should reference a GitHub issue.

## Branch flow

```text
feature branch  →  dev  →  main  →  Vercel production (five apps)
```

| Branch | Purpose |
|--------|---------|
| `chore/…`, `fix/…`, `feat/…` | Implement one issue; open from `dev` |
| **`dev`** | Merge feature branches; run CI locally; **no** production deploy |
| **`main`** | Merge `dev` when ready to release; **only** branch that deploys on Vercel |

Vercel: each `apps/<app>/vercel.json` disables Git deployments except `main` and skips builds on other refs via `ignoreCommand`.

## Standard workflow

### 1. Issue

Create or pick an issue on [jayantrohila57/loftlancer](https://github.com/jayantrohila57/loftlancer/issues).

### 2. Implement on a feature branch

```bash
git checkout dev
git pull --rebase origin dev
git checkout -b fix/short-description
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

### 4. Merge to `dev`

```bash
git checkout dev
git pull --rebase origin dev
git merge fix/short-description
git push origin dev
```

### 5. Release to production (`main`)

When `dev` is ready:

```bash
git checkout main
git pull --rebase origin main
git merge dev
git push origin main
```

Vercel production deploys from this push only.

### 6. Keep `dev` in sync (after release)

```bash
git checkout dev
git merge main
git push origin dev
```

## Rules

- **No force-push** on shared branches.
- **No** production deploys from `dev` or feature branches (enforced in `vercel.json`).
- Pull requests are optional; direct merges are fine.

## Agents

See [AGENTS.md](../AGENTS.md) for the same rules in contributor/agent form.
