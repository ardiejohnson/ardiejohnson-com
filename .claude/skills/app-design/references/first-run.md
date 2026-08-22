# First-run and messaging

The half of design that decides whether the app gets used at all.

## The 5-second test

Screenshot the top of the page at phone width. Show it to someone for five
seconds, then hide it and ask three questions:

1. What is this?
2. Who is it for?
3. What would you tap first?

Three confident answers = pass. Any hesitation is a messaging bug, not a
styling one. Run this before shipping and after every hero rewrite.

## The purpose sentence

One sentence, above the fold, in the user's words.

- Name the outcome, not the mechanism
- Use the word the user would use, not the word the industry uses
- Concrete beats impressive

| Instead of | Say |
|---|---|
| "Real-time sentiment analytics" | "Know if today's a good day to post" |
| "AI-powered SVG generation" | "Describe a shape, get a clean SVG" |
| "Portfolio optimization engine" | "See what your money did this week" |

## Problem before solution

State the frustration first, in the user's voice, then the fix. A user who
hasn't recognized their own problem doesn't care about your solution.

Two lines is usually enough:

> You never know how a post will land until you've already posted it.
> MoodCast reads the room first.

## One primary action

Per screen. One.

- Primary: filled, high contrast, the thing the eye lands on
- Secondary: text or outline, visibly quieter
- Tertiary: a plain link

Two buttons of equal weight force a decision the user isn't equipped to make,
so they make neither. If two actions genuinely tie, the screen is asking the
wrong question.

### CTA copy

Verb first, outcome named, ideally under four words.

| Banned | Better |
|---|---|
| Get Started | Cast today's mood |
| Learn More | See how it scores |
| Submit | Save this forecast |
| Click here | Pick your ticker |
| Continue | Build my first shape |

## First-run instructions

Three steps maximum, shown **in place** — next to the control they describe, not
stacked in a modal the user must clear before seeing the app.

- Inline hints beat tooltips. Tooltips beat modals. Modals beat nothing, barely.
- A tour that must be dismissed before first use is a tax on every new user.
- If it takes more than three steps to explain, the interface is the problem.
  Fix the interface rather than writing step four.
- Show, where possible: a pre-filled example the user can edit is worth more
  than a paragraph telling them what to type.

## States

Every screen needs four, and three of them get forgotten:

**Empty** — teach, don't apologize. Say what will appear here and what to do to
make it appear.
- Bad: "No data yet."
- Good: "Not enough history yet — each reading adds a point and the graph fills
  in here."

**Loading** — say what's happening if it takes more than a moment. A bare
spinner with no label reads as "stuck."

**Error** — plain language, name the next action. Never a code, never "something
went wrong" with no exit.

**Success** — confirm what happened and offer the natural next thing. Don't
dead-end a user who just succeeded.

## Nothing dead-ends

Walk every path to its end. If a screen leaves the user with no obvious next tap
— finished, errored, empty, or complete — it's unfinished.
