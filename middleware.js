import { next } from '@vercel/functions';

/* ===================================================================
   Password gate for ardiejohnson.com

   Runs at the edge on every request, BEFORE any file is served — so
   nothing (not the HTML, not the icons) reaches a browser until the
   right password is entered. The password itself lives in the Vercel
   environment variable SITE_PASSWORD and is never in this repo.

   The session cookie holds an expiry plus an HMAC of that expiry keyed
   on the password, so it can't be forged, and changing the password in
   Vercel immediately invalidates every cookie already out there.
   =================================================================== */

const COOKIE_NAME = 'aj_gate';
const SESSION_DAYS = 30;
const GATE_PATH = '/__gate';

export const config = {
  // Everything is behind the gate. The gate page itself is generated
  // here, not served from a file, so there is nothing to exclude.
  matcher: '/(.*)',
  // Vercel has deprecated the edge runtime for middleware. Node has the
  // Web Crypto API this file needs, so the switch costs nothing.
  runtime: 'nodejs',
};

export default async function middleware(request) {
  const password = process.env.SITE_PASSWORD;
  const url = new URL(request.url);

  if (!password) return notConfiguredPage();

  if (url.pathname === GATE_PATH) {
    return request.method === 'POST'
      ? handleSubmission(request, password)
      : redirectTo('/');
  }

  if (await hasValidSession(request, password)) return next();

  return gatePage({ destination: url.pathname + url.search });
}

async function handleSubmission(request, password) {
  const form = await request.formData().catch(() => null);
  const submitted = form?.get('password');
  const destination = safeDestination(form?.get('next'));

  if (typeof submitted !== 'string' || !(await secretsMatch(submitted, password))) {
    return gatePage({
      destination,
      error: 'That password is not right.',
    });
  }

  const expiresAt = Date.now() + SESSION_DAYS * 86400_000;
  const token = `${expiresAt}.${await hmac(String(expiresAt), password)}`;
  const response = redirectTo(destination);
  response.headers.set(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`,
  );
  return response;
}

async function hasValidSession(request, password) {
  const token = readCookie(request.headers.get('cookie'), COOKIE_NAME);
  if (!token) return false;

  const separator = token.indexOf('.');
  if (separator < 1) return false;

  const expiresAt = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) < Date.now()) return false;

  return secretsMatch(signature, await hmac(expiresAt, password));
}

/* ---------- crypto ---------- */

async function hmac(value, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

// Comparing two secrets by their HMACs under a throwaway per-request key.
// The digests are always the same length, so neither the contents nor the
// length of the guess can be read off the time this takes.
async function secretsMatch(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const salt = crypto.randomUUID();
  return (await hmac(a, salt)) === (await hmac(b, salt));
}

/* ---------- request helpers ---------- */

function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) {
      return part.slice(separator + 1).trim();
    }
  }
  return null;
}

// Only ever send someone back to a path on this site. A value starting
// `//` or `/\` is read as another origin by some browsers, so both are
// refused along with anything that isn't a plain path.
function safeDestination(value) {
  if (typeof value !== 'string' || value.length > 512) return '/';
  if (!value.startsWith('/')) return '/';
  if (value.startsWith('//') || value.startsWith('/\\')) return '/';
  return value;
}

function redirectTo(destination) {
  return new Response(null, {
    status: 303,
    headers: { Location: destination, 'Cache-Control': 'no-store' },
  });
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character],
  );
}

/* ---------- pages ---------- */

function htmlResponse(body, status) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

function gatePage({ destination = '/', error = '' } = {}) {
  return htmlResponse(
    shell({
      status: 'PRIVATE',
      heading: 'This site is private.',
      sub: 'Enter the password to continue.',
      body: `
        <form method="POST" action="${GATE_PATH}" autocomplete="on">
          <input type="hidden" name="next" value="${escapeHtml(destination)}" />
          <label class="label" for="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
            required
            autofocus
          />
          ${error ? `<p class="error" role="alert">${escapeHtml(error)}</p>` : ''}
          <button type="submit">Enter</button>
        </form>`,
    }),
    401,
  );
}

function notConfiguredPage() {
  return htmlResponse(
    shell({
      status: 'NOT CONFIGURED',
      heading: 'The password isn&rsquo;t set yet.',
      sub: 'Nobody can get in until it is.',
      body: `
        <p class="note">
          Add an environment variable named <code>SITE_PASSWORD</code> in the
          Vercel project settings for <code>ardiejohnson-com</code>, then
          redeploy. Until then nothing here is reachable.
        </p>`,
    }),
    503,
  );
}

// Deliberately echoes the site it is guarding — same cool paper ground,
// same Archivo/Plex pairing, same status strip. See DESIGN.md.
function shell({ status, heading, sub, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<title>ardiejohnson.com</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='18' fill='%23101318'/%3E%3Ccircle cx='50' cy='50' r='17' fill='%230B6E4F'/%3E%3C/svg%3E" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root{
  --ground:#F4F5F7; --surface:#FFFFFF; --ink:#101318; --ink2:#5A616C;
  --line:#D5D9E0; --live:#0B6E4F; --warn:#8A6D1F;
}
@media (prefers-color-scheme:dark){
  :root{
    --ground:#0F1215; --surface:#161A1F; --ink:#E9ECEF; --ink2:#9AA2AD;
    --line:#272C33; --live:#4FBE92; --warn:#D6B65F;
  }
}
*{box-sizing:border-box; margin:0; padding:0}
html{-webkit-text-size-adjust:100%}
body{
  background:var(--ground); color:var(--ink);
  font-family:'Archivo',system-ui,-apple-system,sans-serif;
  font-size:16px; line-height:1.55; -webkit-font-smoothing:antialiased;
  min-height:100vh; display:flex; flex-direction:column;
}
.statusbar{
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:13px 20px; background:var(--surface); border-bottom:1px solid var(--line);
}
.mark{
  font-family:'IBM Plex Mono',ui-monospace,monospace; font-size:12px;
  letter-spacing:.08em; text-transform:uppercase;
}
.flag{
  font-family:'IBM Plex Mono',ui-monospace,monospace; font-size:12px;
  letter-spacing:.08em; color:var(--ink2); white-space:nowrap;
}
.dot{color:var(--live)}
main{
  flex:1; display:flex; align-items:center; justify-content:center;
  padding:40px 20px 72px;
}
.panel{
  width:100%; max-width:380px; background:var(--surface);
  border:1px solid var(--line); padding:28px 24px;
}
h1{font-size:21px; font-weight:600; line-height:1.3; letter-spacing:-.01em}
.sub{margin-top:8px; color:var(--ink2); font-size:14.5px}
form{margin-top:22px}
.label{
  display:block; font-family:'IBM Plex Mono',ui-monospace,monospace;
  font-size:11px; letter-spacing:.08em; text-transform:uppercase;
  color:var(--ink2); margin-bottom:7px;
}
input[type=password]{
  width:100%; padding:12px 13px; font-size:16px; font-family:inherit;
  color:var(--ink); background:var(--ground);
  border:1px solid var(--line); border-radius:0;
}
input[type=password]:focus{outline:2px solid var(--ink); outline-offset:-1px}
button{
  width:100%; margin-top:14px; padding:12px 16px;
  font-family:inherit; font-size:15px; font-weight:600; cursor:pointer;
  color:var(--surface); background:var(--ink);
  border:1px solid var(--ink); border-radius:0;
}
button:hover{opacity:.88}
.error{
  margin-top:12px; font-size:14px; color:var(--warn);
}
.note{margin-top:16px; color:var(--ink2); font-size:14.5px}
code{
  font-family:'IBM Plex Mono',ui-monospace,monospace; font-size:13px;
  background:var(--ground); border:1px solid var(--line); padding:1px 5px;
}
</style>
</head>
<body>
<div class="statusbar">
  <span class="mark">ARDIEJOHNSON.COM</span>
  <span class="flag"><span class="dot">&#9679;</span> ${status}</span>
</div>
<main>
  <div class="panel">
    <h1>${heading}</h1>
    <p class="sub">${sub}</p>
    ${body}
  </div>
</main>
</body>
</html>`;
}
