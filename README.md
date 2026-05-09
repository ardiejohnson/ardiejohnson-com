# ardiejohnson.com

Personal portfolio landing page for [ardiejohnson.com](https://ardiejohnson.com).
A single static HTML file listing my apps and experiments, each linking out to its own subdomain.

## Adding a new app

Open `index.html` and copy one of the `<a class="app-card live">…</a>` blocks. Update:
- The `href` to the new app's URL (e.g. `https://flashcards.ardiejohnson.com`).
- The icon (emoji), name, description.
- Use `class="app-card live"` for shipped apps, `class="app-card coming-soon"` for placeholders.

Commit, push — Vercel auto-deploys.

## Local preview

It's just one HTML file — open `index.html` in a browser. No build step.

For a quick local server:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deployment

Hosted on Vercel. Auto-deploys on every push to `main`.
