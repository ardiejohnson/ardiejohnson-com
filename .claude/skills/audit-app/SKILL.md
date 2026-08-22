---
name: audit-app
description: Run a full quality audit on a portfolio app — Lighthouse scores (performance, accessibility, SEO), a scripted phone-size functionality walkthrough, a design and messaging clarity check, page-weight breakdown, and a ranked fix list. Use when asked to audit, health-check, or score an app. Read-only by default; fixes only on request via the normal branch → PR → preview flow.
---

# App audit for `<app>.ardiejohnson.com`

Produce a scored report + screenshots, delivered as files. Born from the fsy-card-maker audit (took it from Performance 64 → 93). Read-only: do not change app code unless Ardie asks for the fixes afterward.

## 0. Get the code
- Remote session: `add_repo` + shallow clone (pre-approved via ardieworks `.claude/settings.json` — no prompts).
- Identify the live URL from the repo's README/CLAUDE.md or the table in ardieworks CLAUDE.md. Never guess a subdomain.

## 1. Static composition (cheap, do first)
- Total page weight, and what it's made of: JS vs CSS vs **base64 data URIs** (the #1 finding is usually a fat embedded image — grep for `data:image.*base64`).
- `gzip -c index.html | wc -c` for what users actually download (Vercel compresses).
- External requests baked into the code (CDN scripts, Google Fonts) — each one is a render delay and an outage dependency.
- Secrets scan: no `eyJ...` JWTs or `sb_secret_` keys committed.

## 2. Lighthouse (mobile)
Sandbox realities (remote sessions):
- The network policy usually **blocks the live URL** → serve the repo locally (`python3 -m http.server`) and audit that. Faithful except CDN timing — say so in the report. NOTE: backgrounded servers die between Bash calls; start the server *in the same command* as the thing that uses it (`nohup ... & sleep 1 && <use it>`).
- Chromium is preinstalled: `export CHROME_PATH=/opt/pw-browsers/chromium`; `npm i -g lighthouse`.
- Run twice: once normally, once with `--blocked-url-patterns` for every external domain the page references. Blocked-but-hanging requests (fonts, CDNs) fake a terrible Speed Index in the first run; the second run shows the true rendering speed. Report the second run's performance score as the real one.

```
lighthouse http://127.0.0.1:PORT/ --quiet \
  --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage" \
  --only-categories=performance,accessibility,best-practices,seo \
  --form-factor=mobile --screenEmulation.mobile --output=json --output-path=./lh.json
```

Pull specifics from the JSON, not just scores: for each failing a11y audit list the actual elements (`audits[key].details.items[].node.selector`), and group color-contrast failures by fg/bg pair — they're usually 2–3 shared colors, not 21 separate problems.

## 3. Functionality walkthrough (Playwright, phone-size)
`npm i playwright`, launch with `executablePath: '/opt/pw-browsers/chromium'`, viewport 390×844, `isMobile: true`. Check:
- **Back-to-home pill** present, upper-left, `position` NOT fixed (portfolio standard)
- The app's core loop (draw a card / log a mood / generate — whatever it is)
- No horizontal overflow: `document.documentElement.scrollWidth > clientWidth`
- Console errors + failed/404 requests — but classify them: sandbox-blocked externals are *expected* (and a chance to verify graceful degradation); a 404 on a same-origin file is a real bug (often the favicon)
- Screenshots of the main view and the core-flow view — they go to Ardie with the report

## 3.5 Design + messaging (form and function)
Lighthouse scores a page that can still be forgettable and unusable to a newcomer. Read `DESIGN.md` at the repo root, then judge against it — see the **app-design** skill for the full standard.

- **The 5-second test** — from the phone screenshot of the top of the page alone, can a brand-new user say what this is, who it's for, and what to tap first? Failing this is the single highest-impact finding an audit can produce.
- **Purpose + problem/solution** stated above the fold in the user's words, not feature language
- **One primary action**, with CTA copy naming the outcome — flag "Get Started" / "Learn More" / "Submit"
- **First-run instructions** — 3 steps max, in place, no modal wall gating the app
- **Empty/loading/error states** are real and teach the next action; nothing dead-ends
- **Matches `DESIGN.md`** — flag contradictions. No `DESIGN.md` at all is itself a finding.
- **Generic tells** — `Inter`/`system-ui` as the *display* face, stock Tailwind grays + `blue-600`, centered hero + two buttons + three feature cards, repeated `rounded-lg` white cards, purple→blue gradients. Each is a finding unless `DESIGN.md` records it as a deliberate exception.
- **Shared bones** — 44px touch targets, body ≥16px on mobile, AA contrast, visible focus states, `prefers-reduced-motion` respected

## 4. The report
Save as `<app>-audit.md`, send with screenshots (SendUserFile). Structure:
1. **Scorecard table** — the four Lighthouse categories, with one-phrase "read as" per row
2. **Functionality checklist** — ✅/⚠️ lines from the walkthrough
3. **Design + messaging** — the 5-second test verdict first, then clarity and generic-tell findings
4. **Findings ranked by impact** — each with the plain-language problem, the fix, and the estimated result. Separate a "not worth chasing" section so small stuff doesn't look urgent.
5. **Bottom line** — one paragraph: is this a clarity problem, a quality problem, or a weight problem, and the suggested fix order.
Plain language throughout; no jargon walls. State the local-serve caveat.

Bonus when the MCP connectors are up: Vercel runtime errors/build logs and Supabase `get_advisors` (performance + security) add production signal no code scan has.

## 5. If Ardie asks for the fixes
Normal shipping flow — branch in the app repo, apply, **verify by re-running steps 2–3** (before/after table), then PR → hand the Vercel preview link. Hard-won specifics:
- Embedded base64 image → decode, resize/re-encode to WebP via Chromium canvas (`page.evaluate` + `toDataURL('image/webp', q)`; no ImageMagick needed). ~800px wide keeps PDF-export quality. Confirm the code uses it as `<img src>` (URL-safe) and any canvas/PDF export uses same-origin images before swapping.
- Contrast fixes: darken the *foreground* colors programmatically just until the ratio clears 4.6 — preserves a sampled/designed palette and is visually near-invisible. Fix the color in every theme, not just the one Lighthouse happened to render.
- Keyboard-trap on hidden panels: toggle `inert` alongside `aria-hidden`.
- Self-hosting CDN assets (fonts, supabase-js) needs a laptop session — remote sandboxes can't download them.
