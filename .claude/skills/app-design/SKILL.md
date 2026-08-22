---
name: app-design
description: How an ardiejohnson.com app should look, read, and onboard a brand-new user. Runs Message first (purpose, problem/solution, one clear next tap, first-run instructions), then Craft (type, color, layout, motion) against the app's own DESIGN.md brief. Use before building or restyling any UI, on a new app, on landing pages, hero and onboarding copy, and empty states — and whenever Ardie says something looks generic, bland, or like every other app.
---

# Designing an ArdieWorks app

Generic apps are not caused by a shortage of design rules. They're caused by
**the absence of a stated point of view**. Given no opinion, any builder produces
the average of everything it has seen: Inter on white with a blue button.

So this skill does not hand you a house style. It gets a point of view on the
record (`DESIGN.md`), then holds the work to it.

Run the phases **in order**. Message before Craft, always — a beautiful screen
that leaves a new user unsure what to tap is a failed screen.

---

## Phase 0 — The brief

**First move on any app: read `DESIGN.md` at the repo root.**

If it exists, that is the app's design law. Everything below is judged against it.

If it doesn't exist, create it with Ardie before touching any UI. Copy
`assets/DESIGN.template.md` and ask these five questions. Ask them in plain
language, one message, and **wait for real answers** — do not infer the audience
from the code. Guessing who the app is for is the exact failure this prevents.

1. **Who opens this?** Not "users" — an actual person with an actual day.
2. **What do they actually want?** The want underneath the feature.
3. **If this app were a place, what would it feel like?** One or two words.
4. **What should it absolutely NOT look like?** Name a thing to refuse.
5. **What's the one thing they must be able to do?** Everything else is secondary.

Write the answers down, commit `DESIGN.md`, then build.

> If Ardie is mid-flow and doesn't want to stop for questions, say so plainly and
> propose a draft brief for him to correct in one line. A corrected draft is a
> real brief. A silently invented one is not.

---

## Phase 1 — Message

Function first. Check every one of these before you style anything.

- [ ] **The 5-second test.** Looking only at what's above the fold on a phone, a
      brand-new user can say: what this is, whose problem it solves, and what to
      do first. If they can't, nothing else on this list matters.
- [ ] **Purpose is one sentence**, in the user's words, not features. "Know if
      today is a good day to post" beats "Real-time sentiment analytics."
- [ ] **Problem then solution**, in that order, stated as the user would say it.
      Name the frustration before naming the fix.
- [ ] **Exactly ONE primary action per screen.** Everything else is visibly
      secondary. Two equal buttons means the user chooses neither.
- [ ] **CTA copy is verb-first and specific** — it names the actual outcome.
      "Cast today's mood," not "Get Started." See the banned list below.
- [ ] **First-run instructions: 3 steps maximum**, shown in place next to the
      thing they describe. Never a modal wall, never a tour the user must dismiss
      before seeing the app.
- [ ] **Empty states teach.** An empty screen shows the next action and what will
      appear once taken. It never just apologizes ("No data yet").
- [ ] **Nothing dead-ends.** Every error, empty, and finished state offers the
      obvious next tap.

MoodCast does this well — its empty chart reads *"Not enough history yet — each
reading adds a point and the graph fills in here."* It explains the mechanism and
implies the action. Copy that instinct.

Depth: `references/first-run.md`.

---

## Phase 2 — Craft

Now make it feel like someone with taste made it, specifically for the person in
`DESIGN.md`.

**Start from the brief's feeling word**, not from a component library. If the
feeling is "a well-worn notebook," you are not reaching for a blue-600 button.

- **Type carries most of the personality.** Pick a display face with an actual
  opinion, pair it with something quiet for UI and body. One display face, one
  workhorse — that's enough. MoodCast's `F.display` / `F.ui` split is the pattern.
- **Build color from the feeling**, then name the tokens semantically
  (`INK`, `INK2`, `LINE`, `CARD`) rather than by hue. Semantic names survive a
  palette change; `blue500` does not.
- **Let the layout have tension.** Asymmetry, a deliberate overlap, one element
  breaking its container, real scale contrast between the biggest and smallest
  type. Centered-everything reads as "no decision was made."
- **Motion needs a reason** — confirm an action, show where something came from,
  reveal a relationship. Decorative animation is noise.
- **Commit to one strong idea** per app rather than three timid ones.

Depth: `references/typography.md`, `references/color-and-motion.md`.

### Banned by default

These are the tells. Using one is not forbidden, but it requires a reason you can
say out loud, written into `DESIGN.md`:

- `Inter` or `system-ui` as the **display** face (fine for body/UI)
- Stock Tailwind grays with a `blue-600` primary
- Centered hero → subhead → two buttons → three feature cards
- `rounded-lg` white card + subtle shadow, repeated down the page
- Purple→blue gradients
- Emoji as the default icon system
- "Get Started," "Learn More," "Submit," "Click here" as CTA copy
- Vague value props: "Streamline your workflow," "Powerful yet simple"

---

## Shared bones

Apps in this portfolio look **distinct** but behave like siblings. These are
non-negotiable regardless of the brief:

- Mobile-first — designed at phone width, then allowed to grow
- Touch targets ≥ 44×44px
- Body text ≥ 16px on mobile
- WCAG AA contrast on body text (4.5:1)
- Visible focus states on everything interactive — never `outline: none` alone
- `prefers-reduced-motion` respected
- Real loading, empty, and error states — not a spinner and a shrug
- One primary action per screen

---

## Known traps

- **Skipping Phase 0 "just this once."** The brief is the whole mechanism. Without
  it this skill degrades into a nicer set of defaults, and defaults are the
  problem.
- **Styling before messaging.** It's more fun, so it happens. The result is a
  beautiful screen nobody knows how to start.
- **Confusing "clean" with "designed."** Clean is the absence of mistakes.
  Designed is the presence of a decision. Aim for the second.
- **Avant-garde as an excuse.** Distinctive never overrides the shared bones. If
  it's unreadable, untappable on a phone, or fails contrast, it isn't bold — it's
  broken.
- **Letting a component library pick the look.** shadcn and friends are fine
  skeletons, but ship them unthemed and every app converges on the same page.
