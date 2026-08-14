---
name: starting-an-app-from-chat
description: The workflow for turning a prototype built in a Claude chat (an HTML page or JSX/React component) into a full ardiejohnson.com portfolio app. Use when Ardie says he has an idea/file from a chat ready to build out, or asks "how do I start a new app".
---

# From a Claude chat prototype to a live app

Ardie prototypes ideas in the Claude chat app, reaches a working HTML/JSX artifact, then moves to Claude Code to build it out with the ArdieWorks agency. This is that handoff.

## First, check what THIS session can do (capabilities, not machines)
The old rule of thumb was "Terminal Claude Code has the tokens, the browser version has nothing." That's out of date: **claude.ai connectors now give web/cloud sessions their own GitHub, Vercel, and Supabase tools**, so the browser version is nearly as capable as the terminal. Don't assume from the device — search the available tools and check:

| Capability | Terminal Claude Code (Mac) | claude.ai/code (browser/phone) with connectors |
|---|---|---|
| Create a repo | **Yes** — `gh repo create ... --template app-template --private` (one command, template applied) | **Yes** — GitHub MCP `create_repository` (private by default), then copy in the public `app-template` contents and push |
| Vercel wiring | **Yes** — `VERCEL_TOKEN` / `npx vercel` | **Yes** — Vercel MCP (`create_git_project`, deployments, build logs) |
| Supabase wiring | **Yes** — Supabase MCP via local config | **Yes** — Supabase MCP connector (projects, migrations, edge functions) |
| GoDaddy DNS | **Yes** — `~/.godaddy/add-subdomain.sh` | **No** — this is the one laptop-only step; otherwise the GoDaddy dashboard |

If a connector is missing in a given session, that step falls back to the manual instruction — the agents inventory this themselves (launch's Step 0).

## The one thing that can't be automated (either way)
There is **no bridge between the Claude chat app and Claude Code** — separate products, no shared file access. The code moves by hand *once*: **paste it straight into the first Claude Code message.** (Saving the artifact to Files and attaching it also works, nicer for very large files, but it's optional — no file export needed.)

## The flow (same everywhere)
One message kicks it off:

> Start a new app called <Name>: <one-line description>. Here's the prototype from a chat: <paste code>. Create the repo from app-template (private), onboard it with new-app, then launch it and open a preview PR.

Then: **new-app** → **launch** → **preview** → **reviewer** → **promote**.

Only if the session truly has no repo-creation tool (no `gh`, no GitHub connector): make the repo by hand first — github.com/ardiejohnson/app-template → **Use this template → Create a new repository** → name it, choose **Private** — then select it in the session and continue. Don't pick `app-template` or `ardieworks` in the repo picker and work there; that pollutes the template/agency.

## Secrets rule for browser sessions
The cloud environment's "Environment variables" field is **plaintext and explicitly not for secrets** (the UI warns it's visible to anyone using the environment). Never paste account tokens there. Connectors are the proper credential path for web sessions — they hold the auth themselves; and the GoDaddy key stays in `~/.godaddy/` on the laptop, outside every repo.

## Rules carried in from the rest of ArdieWorks
- App repos are **private by default** (see the visibility policy in CLAUDE.md).
- Never push to `main`; everything ships branch → PR → preview → review → merge.
- After it's live, walk the **go-live** checklist (domain, DNS, Supabase Site URL, homepage card).
