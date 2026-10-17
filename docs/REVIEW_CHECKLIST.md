# Loftlancer review checklist

LL Review Agent runs this full rules review on any PR into `dev` that touches **UI, auth, the DB or infra**, or whenever someone requests a review. Other PRs get a quick check: the issue link, no secrets, no on-hold work.

## Flow
- [ ] Base branch is `dev` (never `main`). The branch is a feature branch for a single issue.
- [ ] Every commit and the PR body say `Fixes #N`. Use `Refs #N` only for intentionally partial work, and say so in the PR.
- [ ] The PR is small and focused, and the scope matches the issue's acceptance criteria.
- [ ] No `--no-verify`. `pnpm check-types`, `pnpm test`, `pnpm lint:ci` and `turbo build` all pass (CI green).
- [ ] It doesn't touch on-hold work (#221, #223, #224, #344 Mail app, Bing in #350).

## Secrets and env
- [ ] No secret, token or env value is committed. Env var names only, in code and docs.
- [ ] Logs and Sentry carry ids only, never emails, names, tokens or request bodies.

## Auth (Better Auth: GitHub, Google, magic link)
- [ ] Session handling and return values are unchanged unless the issue asks for it.
- [ ] New routes declare who can call them. Public endpoints leak no internals.

## DB (Neon Postgres, Drizzle)
- [ ] Any prod migration notes the Neon backup branch taken first.
- [ ] Queries are bounded, with no N+1 or unbounded scans on hot paths.

## Infra
- [ ] `vercel.json`, crons, instrumentation and CI changes are intentional and explained.
- [ ] No preview or manual deploys. Only `main` deploys, in release windows of at most 3 an hour.

## UI (ReUI-first, dense layout, zero layout shift)
- [ ] It reuses existing code first, or notes a reui.io reference. It's built only from project, shadcn/ui or coss ui components, with no invented designs.
- [ ] Dense layout: text-sm/xs, h-8 controls, gap-1.5 between icon and label, rounded-xl ring-1 cards with 16px padding (full list in `reui_design_system.md`).
- [ ] Jayant's shadcn color tokens only, with no hard-coded colors.
- [ ] It uses the shared PageHeader and table, with real data only and no mock data.
- [ ] Loading skeletons mirror the real layout. Empty, error and saving states keep the same box (zero layout shift).
- [ ] The PR includes before and after screenshots.

## Docs
- [ ] `CHANGELOG.md` `[Unreleased]` is updated for user-facing changes.
- [ ] `docs/integrations.md` is updated when a service, env var name or integration changes.

## Verdict
The review is posted as a GitHub comment that starts with **Verdict: APPROVE** or **Verdict: REQUEST CHANGES**. A formal approval isn't possible because PRs are opened from Jayant's own account. LL CI/CD & Release merges only on an APPROVE verdict with green CI.
