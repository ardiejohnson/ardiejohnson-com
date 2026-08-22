# Design brief — ardiejohnson.com (apex)

The point of view for the portfolio landing site. Read this before any UI work.
If a change disagrees with this file, either the change is wrong or this file
needs updating on purpose — never silently.

## Who opens this
Two people, and they want different things:

1. **Someone deciding whether Ardie is worth talking to.** An investor,
   collaborator, or client who got the link. Scanning fast, asking "is this
   person serious?" The page has about five seconds to earn a second minute.
2. **Someone who wants to use an app.** They heard about MoodCast or Nourish
   Bravely and landed here to get to it. The page is a doorway, not a
   destination.

**When they conflict, #1 wins the top of the page.** The body of work is the
argument; the app list is the proof. A user hunting one app scrolls slightly
further — an acceptable cost, because the list is dense and fast to scan.

## What they actually want
The investor wants evidence of unusual output — that one non-engineer shipped
sixteen real, live, distinct apps. Not a claim about it. Evidence.
The user wants to be in the right app in one tap.

## The one feeling
**A control room.** Precise, dense, operational. Everything legible at a glance,
status visible, nothing decorative. Reads as capable and in command.

## What this must NOT look like
All four of these are refused:

- **The old page.** Gradient on the name, emoji as the icon system, "🛠 Apps" as
  a heading, Inter everywhere, uniform rounded cards in a grid, floating blobs.
- **A dev-portfolio template.** No terminal prompt, no `$ whoami`, no monospace
  body text, no dark-mode-because-developer. Density is the goal; the hacker
  costume is not. *This is the sharpest line in the file — "control room" and
  "dev portfolio" fail in similar directions, and only one of them is wanted.*
- **A startup landing page.** No centered hero, no subhead + two buttons, no
  three feature cards, no testimonial row. Nothing here is being sold.
- **A résumé or CV.** No timeline, no skills bars, no "About Me", no work
  history. The sixteen apps are the credential.

## The one thing they must be able to do
Understand, immediately, that this person has shipped sixteen live apps solo —
and open any one of them in a single tap.

---

## The system

**Type:** Archivo for display and body (tight, confident, not Inter) /
IBM Plex Mono for data, labels, and status only — never for running text.

**Color:** cool paper ground, not white. Semantic status color is separate from
the accent and carries real meaning.

```
--ground  #F4F5F7   page, cool grey-blue
--surface #FFFFFF   rows and bars
--ink     #101318   primary text
--ink2    #5A616C   secondary text
--line    #D5D9E0   borders and rules
--live    #0B6E4F   operational green — means "live", nothing else
```

**Numerals:** `font-variant-numeric: tabular-nums` everywhere digits appear.
Counts and stats line up in columns.

**Motion:** almost none. A row highlights on hover/press. Nothing animates in on
scroll, nothing floats, nothing pulses. Stillness is the feeling.

**Signature move:** the status bar. A persistent top strip reading
`ARDIEJOHNSON.COM · ● 16 LIVE`, with a live count that is a real count, plus a
three-up stat block (live / solo / idea→ship) directly under the thesis line.
Sixteen dense rows read as *sixteen* in a way sixteen cards never did.

## Deliberate exceptions
None in use. Every app entry is a table row, not a card.

## Known traps
- The app count is stated in the hero. **It must match reality** — update it when
  an app ships, or the most persuasive fact on the page becomes a lie.
- Nourish Bravely and Legacy are tender subjects sitting in a cool, operational
  frame. Keep their descriptions warm and human even though the chrome is not.
