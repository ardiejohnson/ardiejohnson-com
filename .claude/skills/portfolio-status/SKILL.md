---
name: portfolio-status
description: Sweep the whole ardiejohnson.com portfolio and report its health — domains resolving, latest production deploys green, open PRs waiting, runtime errors, Supabase security/performance advisories. Use when Ardie asks "how's everything doing", "any problems?", or wants a portfolio checkup. Read-only; fixes go through the normal branch → PR → preview flow.
---

# Portfolio health check

One pass over every deployed app, ending in a short scoreboard and a "needs attention" list. Read-only — never change anything during the sweep; propose fixes at the end and only act when Ardie says so.

## What to sweep
The app list is the repos table in the ardieworks CLAUDE.md (skip `auction-app` — not deployed). For each app, check whatever this session has tools for; skip-and-say-so for the rest:

1. **Is it up?** Fetch the live URL (e.g. `curl -sI https://<app>.ardiejohnson.com`, or WebFetch). Expect 200 (or the app's known auth gate). A 404/5xx or certificate error goes straight to "needs attention". Note: some sandboxes block outbound fetches — if so, rely on the Vercel deployment state instead and say so.
2. **Latest production deploy** (Vercel MCP `list_projects` → `list_deployments`): is the most recent production deployment READY? If FAILED, grab the top of the build log for the report.
3. **Runtime errors** (Vercel MCP `get_runtime_errors`): anything crashing in production that a green build hides.
4. **Open PRs** (GitHub tools, per repo via `add_repo` if needed): anything sitting unmerged — previews Ardie may have forgotten to promote, or stale branches. Include age.
5. **Supabase advisors** (Supabase MCP `get_advisors`, security + performance) for the apps with backends (`artcoach`, `legacy`, and any new ones): unfixed security advisories are automatic "needs attention" items.
6. **Analytics glance** (Vercel MCP `get_web_analytics`, if available): anything unusual worth a sentence — traffic spike, dead app.

## The report
Keep it phone-readable:
1. **Scoreboard table** — one row per app: Live ✅/❌ · Last deploy ✅/❌ · Open PRs (count) · Notes (one phrase max).
2. **Needs attention** — ranked list, each item with the plain-language problem and the suggested next step. Empty? Say "all quiet" and stop.
3. **Suggested fixes** — only for real problems, each as an offer ("want me to fix X? It'd go out as a preview PR on <repo>"), never as work already started.

## Running it on a schedule
This skill works as a recurring routine (e.g. weekday mornings) in sessions that support scheduled triggers. When run on a schedule: if everything is green, stay quiet or one line — don't generate a daily wall of ✅. Only surface a report when something actually needs attention.
