---
name: go-live
description: The go-live checklist for shipping an ardiejohnson.com app to production — everything that must be true before and after merging to main. Use when promoting an app for the first time, or auditing a live app. Born from the ArtCoach launch.
---

# Go-live checklist for `<app>.ardiejohnson.com`

Work through in order. Do not merge until the "Before merging" list is complete.

## Before merging
- [ ] QA'd on the Vercel **preview URL** (not localhost, not production) — the full core loop, on a phone
- [ ] `npm run build` passes (skip for static single-file apps)
- [ ] **reviewer** agent pass is clean (build, secrets, mobile, RLS if Supabase)
- [ ] If Supabase: all files in `supabase/migrations/` have been run on the live project — including any added in this PR (run migrations BEFORE merging; new columns are ignored by old code, so this is safe)
- [ ] Env vars exist in Vercel for **all environments** (a preview built before the vars existed needs a fresh push, not a browser refresh)

## After merging (the wiring)
- [ ] Domain: Vercel project → Settings → Domains → add `<app>.ardiejohnson.com`
- [ ] DNS: `CNAME <app>` → the per-project target from Vercel's Domains tab (laptop: `~/.godaddy/add-subdomain.sh <app> <target>`; otherwise GoDaddy dashboard). Add the domain in Vercel first so it shows you the target. HTTPS is automatic once Vercel sees the record. **Not** the old A record `76.76.21.21` — it resolves but no longer serves new domains, which reads as a stuck certificate
- [ ] If Supabase: Authentication → URL Configuration → **Site URL** = `https://<app>.ardiejohnson.com` + add it to **Redirect URLs** (otherwise confirmation/reset emails point at localhost)
- [ ] Branch protection on `main` (GitHub → Settings → Branches → require a pull request)
- [ ] Homepage card: add the app to `ardiejohnson-com`'s `.apps` grid via its own PR — merge only after the domain resolves
- [ ] Victory-lap test on the real domain: sign up / core loop / sign out, on a phone

## Known traps (learned the hard way)
- The production URL 404s until the first merge to `main` — that's expected, don't "fix" it.
- Supabase's Site URL defaults to `localhost:3000`; every auth email is broken until it's set.
- Supabase email links are one-time: after a failed redirect, send a fresh email rather than re-tapping the old link.
- A user stuck half-confirmed can be fixed in Supabase → Authentication → Users → Confirm email.
- The `service_role` key never goes anywhere. Client code uses anon/publishable only.
