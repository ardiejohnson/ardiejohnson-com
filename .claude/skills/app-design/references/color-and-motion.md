# Color, layout, and motion

## Color

### Name tokens by role, never by hue

Semantic names survive a palette change; `blue500` doesn't. MoodCast's set is
the pattern:

```js
const INK  = "#1B2330";  // primary text
const INK2 = "#5E7196";  // secondary text
const LINE = "#E3E8EF";  // borders, dividers
const CARD = "#FFFFFF";  // raised surface
const BG   = "#F7F9FC";  // page ground
const ACCENT = "…";      // the one color that means "act"
```

Everything downstream references the role. Reskinning the app then means editing
six lines, not three hundred.

### Build the palette from the feeling

Start with the brief's feeling word and pick a **ground** first — the page
background sets the mood far more than the accent does. Off-white, warm paper,
deep ink, muted sage: anything but `#FFFFFF` reads as a decision.

Then:

- **One accent** that means "act." If everything is colored, nothing is.
- **Two or three neutrals**, tinted toward the accent rather than pure gray.
  Pure `#808080` gray is the fastest way to look unfinished.
- **Semantic colors** (success/warning/error) drawn *into* the palette, not
  dropped in at stock red and green.

### Contrast

- Body text ≥ 4.5:1 against its background. Check it, don't eyeball it.
- Large text (≥24px, or 19px bold) ≥ 3:1.
- Never signal something by color alone — pair it with an icon, weight, or
  label, or it disappears for colorblind users.

## Layout

Centered-everything is what a page looks like when no decision was made.

- **Let something break the grid.** One element overlapping its container, one
  full-bleed edge, one deliberate asymmetry.
- **Scale contrast is free drama.** A very large element next to a very small
  one creates hierarchy that even spacing can't.
- **Spacing on a scale**, same as type — 4/8/12/16/24/32/48/64. Arbitrary
  one-off values are what make a layout feel slightly wrong without being
  obviously wrong.
- **Group by proximity before reaching for a border.** Most cards exist because
  spacing wasn't used properly. A page of identical bordered boxes is the
  `rounded-lg` tell.
- **Mobile first, genuinely.** Design at 375px, then let it grow. A desktop
  layout squeezed down always shows.

## Motion

Motion earns its place by doing a job:

- **Confirm** an action registered
- **Show origin** — where a panel came from, so it can be dismissed back
- **Reveal relationship** — what changed and what caused it

If it does none of those, cut it.

### Rules

- **Fast.** 150–250ms for most UI transitions. Anything over 400ms feels like
  lag on the fifth use.
- **Ease out** for things entering, ease in for things leaving.
- **Transform and opacity only** where possible — animating layout properties
  drops frames on a phone.
- **One thing moves at a time.** Simultaneous animation reads as chaos.
- **Respect the setting:**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### The signature move

Most apps in this portfolio should have exactly one distinctive motion or
interaction — the thing that makes it recognizably itself. Pick it deliberately,
write it into `DESIGN.md`, and use it consistently rather than adding a
different flourish per screen.
