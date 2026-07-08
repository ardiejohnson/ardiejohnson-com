# ArtCoach — Build Plan (plain language)

[ARCHITECTURE.md](./ARCHITECTURE.md) describes where ArtCoach ends up — the full
platform with Kubernetes clusters, Kafka queues, and GPU fleets. This document
is the honest translation: **how we actually start building it with the tools
this portfolio already uses**, and how each phase grows toward that architecture
without throwing anything away.

The big idea doesn't change: ArtCoach is a **visual intelligence platform, not a
chatbot**. What changes is the plumbing — at our scale, one modern vision-capable
AI model plus Supabase plays the role that a dozen microservices play in the full
architecture.

---

## Where ArtCoach lives

Per portfolio convention, ArtCoach gets **its own repo and subdomain**:

| Repo | Subdomain |
|---|---|
| `artcoach` | artcoach.ardiejohnson.com |

Start it from the `app-template` ("Use this template" on GitHub), import into
Vercel, attach the subdomain — same as every other app. This repo
(`ardiejohnson-com`) just holds the planning docs and, once ArtCoach is live, a
card on the landing page.

## The stack (maps 1:1 to the architecture doc)

| Full architecture calls for | We use | Why it's the same thing, smaller |
|---|---|---|
| Web app (React/Next.js) | **Vite + React 19 + TypeScript + Tailwind** | Our standard stack; mobile-first so it works great on a phone |
| API Gateway + backend services | **Vercel serverless functions** (`/api` folder) | Routing, auth checks, and rate limiting without running servers |
| User Identity Service | **Supabase Auth** | Sign-in, sessions, and user profiles out of the box |
| PostgreSQL | **Supabase Postgres** (RLS on every table) | Users, artworks, analyses, progress |
| Vector DB for RAG | **Supabase pgvector** | Same Postgres, no extra service to pay for |
| Object storage | **Supabase Storage** | Artwork images and generated overlays, with per-user privacy rules |
| Vision Agent + expert agents | **Claude (vision-capable model) called with structured output schemas** | One model, called in stages with different expert prompts, passing JSON between stages — the same agent pipeline, just orchestrated in a serverless function instead of Kubernetes |
| Analytics DB, Kafka, ClickHouse | **Skip for now** | A `scores` table and simple charts cover Phase 1–3 needs |

**Secrets rule:** the Claude API key lives only in Vercel environment variables
and is only used inside serverless functions — never in client code. The client
uses the Supabase anon key only.

---

## Phase 1 — the MVP critique loop (build this first)

**What a user can do:** sign in → upload a photo of their artwork → get a
structured, teacherly critique → save it to their portfolio.

**What to click to test it:** upload a drawing from your phone camera roll and
read the critique.

How the multi-agent pipeline works at this stage — one serverless function runs
the stages in order, passing structured JSON between them (this *is* the
architecture doc's pipeline, run as prompt stages instead of separate services):

```
Upload (Supabase Storage)
   |
1. Vision pass      → Claude looks at the image, returns the Visual Feature
                      Graph as JSON (composition, colors, values, focal points)
2. Expert passes    → Design, Color, and Style prompts each receive that JSON
                      (not the raw image) and return their structured analysis
3. Teacher pass     → turns the combined analysis into the ArtworkAnalysis
                      schema: summary, strengths, improvements, exercises,
                      scores — tuned to the user's skill level
   |
Saved to Postgres, shown in the app
```

Database tables (all with Row Level Security):

- `profiles` — skill level, interests, preferred feedback style, learning goals
- `artworks` — title, medium, image location, analysis status
- `analyses` — the full ArtworkAnalysis JSON + scores
- `knowledge` — art-teaching reference content with pgvector embeddings (the
  RAG knowledge base; start with ~50 hand-picked entries on design principles,
  color theory, and composition, and grow it)

**Deliberately out of scope for Phase 1:** drawing studio, realtime coaching,
overlays, art-history agent, personalization engine, mobile apps.

---

## Phase 2 — overlays + interactive coaching

- **Overlays:** the analysis already returns focal points and composition data
  as coordinates — render rule-of-thirds grids, focal-point markers, and
  eye-path arrows as **SVG layered over the image** in the browser. No new
  backend needed.
- **Coaching chat:** "ask a follow-up about this critique" — a conversation
  endpoint that carries the artwork's analysis JSON as context.
- **Art History expert** joins the pipeline (works well with RAG over the
  knowledge base).

## Phase 3 — learning + progress

- Progress dashboard: scores over time per design principle (the `analyses`
  table already has everything needed).
- Personalized recommendations: "your last five pieces score low on value
  contrast → here are monochromatic value-study exercises" — generated from
  artwork history + the knowledge base.
- Lessons and exercises tracked to completion.

## Phase 4 — the studio and beyond

The drawing engine, stylus support, and realtime stroke-by-stroke coaching are
the biggest engineering lift in the whole architecture — genuinely native-app
territory. By this point ArtCoach has real users telling us whether they want
to *draw in* ArtCoach or keep *uploading to* it. Decide then. This is also
where the full architecture doc (queues, realtime services, specialized CV
models) becomes the actual roadmap rather than the aspiration.

New domains (typography, photography, UI/UX…) slot in exactly as the
architecture describes: a new expert prompt + a new knowledge domain + a new
rubric. Nothing about the Phase 1 design blocks this.

---

## What it costs to run (roughly)

- **Vercel + Supabase:** free tiers cover the MVP comfortably.
- **Claude API:** each critique is a few vision + text calls — pennies per
  artwork. Add a simple per-user daily analysis limit from day one so a bug or
  abuse can't run up a bill.

## First concrete steps

1. Create the `artcoach` repo from `app-template`; import into Vercel; attach
   `artcoach.ardiejohnson.com`; turn on branch protection.
2. **backend-supabase** agent: create the four tables + storage bucket + RLS.
3. **frontend-builder** agent: upload flow → critique display → portfolio list.
4. Write the four pipeline prompts (vision, design/color/style experts,
   teacher) and the ArtworkAnalysis JSON schema.
5. Preview on a branch, QA from a phone, run **reviewer**, then promote.
