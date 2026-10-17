# Services & integrations inventory

Living list of every third-party service and first-party system Loftlancer
uses: what it is for, its plan and limits, who owns the account, how it is
connected, and the env var **names** it needs. Never put values here.

Keep this file current: any PR that adds, changes or removes a service updates
its row (see #361).

Last verified: **2026-10-17** (production, loftlancer.com).

## Production verification (2026-10-17)

All six services set up on 2026-10-17 were tested against production after the
deploy that carried their keys (#347):

| Service | Test | Result |
|---|---|---|
| Upstash Redis | write, read back and delete a test key | pass |
| Vercel Blob | upload, read back and delete a test file | pass |
| Sentry | test error sent; event accepted and visible in the `loftlancer` project; browser SDK loads on every page | pass |
| Vercel Web Analytics | enabled in the project; script loads | pass |
| Vercel Speed Insights | script loads; data collecting | pass |
| Resend | domain `mail.loftlancer.com` verified; test email from `noreply@mail.loftlancer.com` delivered to the owner's Gmail Inbox (not Spam) at 09:26 IST | pass |

Notes from setup:

- **Resend** was reconnected: the first Vercel link had expired and never wrote
  the key, so Resend's access to Vercel was removed and linked again, the unused
  key was deleted, and a fresh key was saved. `RESEND_API_KEY` is a
  **send-only** key (it cannot read or manage the Resend account).
- Invite emails go live in production with the release that follows #347,
  because that is the first deploy built with `RESEND_API_KEY` present.

## Inventory

| Name | Category | Purpose / use cases | 1st/3rd | Plan / free limits | Account owner / login | Connection | Env var names | Apps | Status | Dashboard |
|---|---|---|---|---|---|---|---|---|---|---|
| Vercel | hosting | Hosting, deploys, runtime logs, usage | 3rd | Hobby: 100 deploys/day | Jayant, Vercel team jayantrohila (team_kdA2Os0Cq4MnYuLGHn1EyzvS) | Git (GitHub), deploys from `main` only | VERCEL_* (system) | docs, auth, studio | connected | https://vercel.com/jayantrohila/loftlancer |
| Neon | db | Postgres, the authoritative business and usage record | 3rd | Free (branch limit 10) | Jayant | Vercel Marketplace native | DATABASE_URL, DATABASE_URL_POOLED (+ Neon-provided vars) | auth, studio | connected | https://console.neon.tech/app/projects/sweet-glade-82381573 |
| Better Auth | auth | Sessions, orgs, permissions, audit hooks | 1st (library) | OSS | n/a | code | BETTER_AUTH_SECRET, BETTER_AUTH_URL | auth, studio | code live | n/a |
| GitHub OAuth | auth | GitHub sign-in | 3rd | Free | Jayant (GitHub jayantrohila57) | manual OAuth app | GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET | auth | connected | https://github.com/settings/developers |
| Hostinger DNS | DNS | loftlancer.com DNS: Resend SPF/DKIM/DMARC, verification TXT | 3rd | Domain plan | Jayant's own Hostinger account (not the Lucsum one) | manual | n/a | n/a | connected | https://hpanel.hostinger.com |
| Resend | email | Transactional email (invites, system mail) from `noreply@mail.loftlancer.com` | 3rd | Free: 3,000/mo, 100/day | Jayant's existing free account | Vercel Marketplace (linked existing account; reconnected 2026-10-17) | RESEND_API_KEY (send-only key) | auth, studio | **verified in prod**; domain `mail.loftlancer.com` verified (SPF/DKIM/DMARC on Hostinger) | https://resend.com/domains |
| React Email | email | Email templates/UI | 1st (library) | OSS | n/a | code (`packages/email`) | n/a | auth, studio | code live | n/a |
| Sentry | observability | Frontend and backend errors | 3rd | Developer (free): 5k errors/mo | Vercel-native Sentry org `loftlancer` (US region) | Vercel Marketplace native | NEXT_PUBLIC_SENTRY_DSN, SENTRY_DSN, SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT | docs, auth, studio | **verified in prod** (test event accepted); source maps uploaded on production builds (#364) | https://loftlancer.sentry.io |
| Upstash Redis | cache | Rate limiting, cache | 3rd | Free: 500k commands/mo | Vercel Marketplace (Jayant) | Vercel Marketplace native (`loftlancer-redis`, Singapore) | KV_REST_API_URL, KV_REST_API_TOKEN (+ KV_*) | auth, studio | **verified in prod**; app code pending | https://console.upstash.com |
| Vercel Blob | storage | File uploads (avatars, attachments) | 3rd | Hobby free tier | Vercel team jayantrohila | Vercel native (`loftlancer-blob`, public) | BLOB_READ_WRITE_TOKEN | studio | **verified in prod**; app code pending | https://vercel.com/jayantrohila/~/stores |
| Vercel Web Analytics | analytics | Public site and app page views (cookieless) | 3rd | Hobby free tier | Vercel team jayantrohila | Vercel native (`@vercel/analytics`) | n/a | docs, auth, studio | **enabled**, verified in prod | Vercel project → Analytics |
| Vercel Speed Insights | observability | Core Web Vitals | 3rd | Hobby free tier | Vercel team jayantrohila | Vercel native (`@vercel/speed-insights`) | n/a | docs, auth, studio | **verified in prod** | Vercel project → Speed Insights |
| GitHub | hosting/dev | Repo, issues, Project board, CI | 3rd | Free | jayantrohila57 | n/a | n/a | all | connected | https://github.com/jayantrohila57/loftlancer |
| Audit log (`audit_event` tables) | db/observability | Audit trail for sensitive actions | 1st | n/a | n/a | code | ACTIONS_AUDIT_ENABLED | auth, studio | code live (partial, #357) | Studio activity |
| Analytics consent banner | privacy | Asks once before optional analytics (GA4, PostHog) load; choice in localStorage `ll_analytics_consent` | 1st | n/a | n/a | code (`@loftlancer/ui/patterns/analytics-consent`) | n/a | docs, studio | code live; shows only once GA4 or PostHog is configured | n/a |
| SEO (metadata, sitemap, robots, JSON-LD) | SEO | Canonical URLs, per-page titles, sitemap of public URLs, robots disallow /studio and /auth, noindex on private apps, Organization/WebSite/SoftwareApplication JSON-LD | 1st | n/a | n/a | code (apps/docs) | NEXT_PUBLIC_DOCS_URL (optional, defaults to https://loftlancer.com) | docs (+ noindex in auth, studio) | code live (#352) | https://loftlancer.com/sitemap.xml |
| Mail app (#344) | email | Internal mailbox for all sent mail | 1st | n/a | n/a | code | n/a | mail (3rd app) | todo | n/a |
| Google Cloud + OAuth | auth | Google account linking, Google APIs | 3rd | Free | TBD (Jayant) | manual | GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET | auth | todo (#359) | https://console.cloud.google.com |
| Google Search Console | SEO | Indexing, search performance | 3rd | Free | TBD (Jayant) | meta tag or DNS TXT | GOOGLE_SITE_VERIFICATION (meta tag, code ready) | docs | todo (#350) | https://search.google.com/search-console |
| Bing Webmaster Tools | SEO | Bing visibility | 3rd | Free | TBD (Jayant) | import from GSC, or meta tag | BING_SITE_VERIFICATION (meta tag, code ready) | docs | todo (#350) | https://www.bing.com/webmasters |
| Google Analytics 4 | analytics | Acquisition, conversions | 3rd | Free | TBD (Jayant) | code (env-gated, consent-gated) | NEXT_PUBLIC_GA_MEASUREMENT_ID | docs (public site only) | code ready, no-op until the ID is set (#351) | https://analytics.google.com |
| PostHog | analytics | Product analytics, funnels, replay (inputs masked), flags | 3rd | Free: 1M events/mo, 5k replays/mo | TBD (Jayant) | code (env-gated, consent-gated, CDN loader, no npm dependency) | NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST (default https://us.i.posthog.com) | studio only | code ready, no-op until the key is set (#353) | https://app.posthog.com |
| Uptime monitor (Better Stack / UptimeRobot) | observability | Uptime checks, alerts | 3rd | Free tier | TBD (Jayant picks) | manual | n/a | all | todo (#356) | TBD |
| Centralized logs | observability | Searchable logs across apps | 3rd | TBD | TBD | TBD | TBD | all | partial (#355) | TBD |

## Turning on an env-gated integration

GA4, PostHog and the search-console verification tags are read at **build
time**. Add the variable in Vercel (Production), then let it ride the next
batch push to `main`; do not trigger a separate deploy (Hobby: 100/day).
