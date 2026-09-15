# ardiejohnson.com

Personal portfolio landing page for [ardiejohnson.com](https://ardiejohnson.com).
A single static HTML file listing my apps and experiments, each linking out to its own subdomain.

## Adding a new app

Open `index.html` and copy one of the `<a class="app-card live">…</a>` blocks. Update:
- The `href` to the new app's URL (e.g. `https://flashcards.ardiejohnson.com`).
- The icon (emoji), name, description.
- Use `class="app-card live"` for shipped apps, `class="app-card coming-soon"` for placeholders.

Commit, push — Vercel auto-deploys.

## The password gate

The whole site sits behind a password. `middleware.js` runs at Vercel's edge on
every request, so nothing — not the page, not the icons — is sent to a browser
until the right password is entered. A signed, HttpOnly cookie then keeps you in
for 30 days.

The password itself is **never in this repo**. It lives in one Vercel
environment variable:

| Variable        | Where                                                              |
|-----------------|--------------------------------------------------------------------|
| `SITE_PASSWORD` | Vercel -> `ardiejohnson-com` -> Settings -> Environment Variables |

Set it for **Production** and **Preview**, then redeploy. A few things worth knowing:

- **Changing the password logs everyone out.** The cookie is signed with the
  password, so old cookies stop working the moment you change it.
- **If the variable is missing, nobody gets in** — the site returns a "not
  configured" page rather than falling open.
- **Search engines can't index the site** while the gate is up.
- **A wrong password always costs a second.** That slows guessing down; it is
  not a lockout, so a long passphrase is still what actually protects the site.
- To take the gate off entirely, delete `middleware.js` and merge.

Run `npm test` to check the gate still behaves (19 checks, no network needed).

## Local preview

It's just one HTML file — open `index.html` in a browser. No build step, and no
password prompt locally: the gate only runs on Vercel.

For a quick local server:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deployment

Hosted on Vercel. Auto-deploys on every push to `main`.
