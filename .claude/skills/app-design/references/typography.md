# Typography

Type carries more personality than color does. It's also the fastest tell that
nobody made a decision — `Inter` as a display face is the design equivalent of
naming a file `untitled`.

## The pairing

**One display face with an opinion. One quiet workhorse.** That's the whole
system. Two faces is plenty; three needs a reason.

- **Display** — headings, hero, numbers that matter. This is where the app's
  character lives. Pick something with an actual voice: a real serif, a
  condensed grotesque, a geometric with unusual details, a humanist with warmth.
- **Workhorse** — body, UI, labels, form fields. Quiet, legible at 14–16px, gets
  out of the way. `Inter`, `system-ui`, or the platform stack is correct here.

MoodCast's `F.display` / `F.ui` split is the pattern to copy — one object,
two roles, referenced everywhere.

```js
const F = {
  display: "'Fraunces', Georgia, serif",
  ui: "'Inter', -apple-system, system-ui, sans-serif",
};
```

## Picking a display face from the brief

Read the feeling word, then choose:

| Feeling | Direction |
|---|---|
| Warm, human, hand-made | Humanist serif, or a serif with real contrast |
| Precise, technical, trustworthy | Grotesque or a mono for numerals |
| Editorial, considered, adult | High-contrast serif, generous leading |
| Playful, quick, light | Rounded or geometric sans with quirks |
| Loud, confident, physical | Condensed heavy sans, tight tracking |

Google Fonts is fine and loads in every app. Pick something that isn't in the
top ten most-used list.

## Scale

Pick a ratio and stick to it. 1.25 (major third) is a safe default; 1.333 or
1.5 give more drama and suit a display-led design.

```
12 · 14 · 16 · 20 · 25 · 31 · 39 · 49    (1.25 from 16)
```

Rules that matter more than the exact numbers:

- **Body ≥ 16px on mobile.** Non-negotiable — smaller triggers zoom on iOS
  inputs and reads as an afterthought.
- **Real contrast between the largest and smallest.** If your h1 is 24px and
  your body is 16px, nothing has a hierarchy. A 3–4× jump is where a page
  starts to feel designed.
- **Line height inverse to size.** ~1.5–1.6 for body, ~1.1–1.25 for large
  headings. Big type with body leading looks slack.
- **Line length 60–75 characters** for reading text. `max-width: 65ch`.
- **Tracking:** tighten large display type slightly (`-0.02em`), open up small
  uppercase labels (`0.08em`).

## Weight

Use weight, not just size, to build hierarchy. Two sizes and three weights beats
five sizes and one weight.

Avoid the middle: a 400 next to a 500 reads as a rendering bug. Jump — 400 body
against 700/800 emphasis.

## Loading

- Subset to the weights actually used; every extra weight is real phone bytes
- `font-display: swap` so text renders immediately
- Always give a real fallback stack — the fallback should be a reasonable
  substitute, not a random default
