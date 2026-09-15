import assert from 'node:assert/strict';

process.env.SITE_PASSWORD = 'correct-horse-battery-staple';
const { default: middleware } = await import('../middleware.js');

const ORIGIN = 'https://ardiejohnson.com';
const get = (path, cookie) =>
  new Request(ORIGIN + path, { headers: cookie ? { cookie } : {} });
const post = (fields) =>
  new Request(ORIGIN + '/__gate', {
    method: 'POST',
    body: new URLSearchParams(fields),
  });

const isPassThrough = (res) =>
  res.headers.get('x-middleware-next') === '1' || res.status === 200;

let passed = 0;
const check = (name, fn) =>
  fn().then(
    () => { passed++; console.log('  ok   ' + name); },
    (err) => { console.log('  FAIL ' + name + '\n       ' + err.message); process.exitCode = 1; },
  );

// --- locked out -------------------------------------------------------
await check('no cookie -> 401 gate page, site HTML not served', async () => {
  const res = await middleware(get('/'));
  assert.equal(res.status, 401);
  const body = await res.text();
  assert.match(body, /This site is private/);
  assert.doesNotMatch(body, /Sixteen live apps/);
  assert.equal(res.headers.get('cache-control'), 'no-store');
});

await check('assets are gated too', async () => {
  const res = await middleware(get('/icons/closr.svg'));
  assert.equal(res.status, 401);
});

await check('forged cookie is refused', async () => {
  const future = Date.now() + 86400_000;
  const res = await middleware(get('/', `aj_gate=${future}.${'a'.repeat(64)}`));
  assert.equal(res.status, 401);
});

await check('garbage cookie is refused', async () => {
  for (const value of ['aj_gate=nonsense', 'aj_gate=.', 'aj_gate=', 'aj_gate=123.']) {
    const res = await middleware(get('/', value));
    assert.equal(res.status, 401, 'for cookie: ' + value);
  }
});

await check('wrong password -> 401 with an error, no cookie set', async () => {
  const res = await middleware(post({ password: 'hunter2', next: '/' }));
  assert.equal(res.status, 401);
  assert.equal(res.headers.get('set-cookie'), null);
  assert.match(await res.text(), /That password is not right/);
});

// --- letting the right person in --------------------------------------
let session;
await check('right password -> 303 + signed cookie', async () => {
  const res = await middleware(post({ password: process.env.SITE_PASSWORD, next: '/' }));
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), '/');
  const cookie = res.headers.get('set-cookie');
  assert.match(cookie, /^aj_gate=\d+\.[0-9a-f]{64};/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);
  session = cookie.split(';')[0];
});

await check('valid cookie passes through to the real site', async () => {
  const res = await middleware(get('/', session));
  assert.ok(isPassThrough(res), 'expected pass-through, got status ' + res.status);
});

await check('expired cookie is refused', async () => {
  const past = Date.now() - 1000;
  // Re-sign a past expiry with the real password: still refused on time alone.
  const signed = await middleware(post({ password: process.env.SITE_PASSWORD, next: '/' }));
  const realSig = signed.headers.get('set-cookie').split('=')[1].split('.')[1].split(';')[0];
  const res = await middleware(get('/', `aj_gate=${past}.${realSig}`));
  assert.equal(res.status, 401);
});

await check('a wrong password costs a second, a right one does not', async () => {
  const wrongStart = Date.now();
  await middleware(post({ password: 'wrong', next: '/' }));
  const wrongMs = Date.now() - wrongStart;

  const rightStart = Date.now();
  await middleware(post({ password: process.env.SITE_PASSWORD, next: '/' }));
  const rightMs = Date.now() - rightStart;

  assert.ok(wrongMs >= 950, `wrong answer returned in ${wrongMs}ms, expected a delay`);
  assert.ok(rightMs < 500, `right answer took ${rightMs}ms, should not be delayed`);
});

// --- open-redirect safety --------------------------------------------
await check('off-site redirect targets are refused', async () => {
  for (const target of ['//evil.example', '/\\evil.example', 'https://evil.example', 'evil']) {
    const res = await middleware(post({ password: process.env.SITE_PASSWORD, next: target }));
    assert.equal(res.headers.get('location'), '/', 'for next=' + target);
  }
});

await check('a real deep link is preserved', async () => {
  const res = await middleware(post({ password: process.env.SITE_PASSWORD, next: '/docs/artcoach' }));
  assert.equal(res.headers.get('location'), '/docs/artcoach');
});

await check('deep link survives the round trip', async () => {
  const res = await middleware(get('/docs/artcoach?x=1'));
  assert.match(await res.text(), /name="next" value="\/docs\/artcoach\?x=1"/);
});

await check('a crafted URL cannot inject markup', async () => {
  const body = await (await middleware(get('/"><script>alert(1)</script>'))).text();
  assert.doesNotMatch(body, /<script>alert\(1\)<\/script>/);
});

// The POST path is where raw quotes can actually reach the template:
// form fields are not percent-encoded the way a URL pathname is.
await check('a crafted next field is escaped, not injected', async () => {
  const res = await middleware(
    post({ password: 'wrong', next: '/"><script>alert(1)</script>' }),
  );
  const body = await res.text();
  assert.doesNotMatch(body, /<script>alert\(1\)<\/script>/);
  assert.match(body, /value="\/&quot;&gt;&lt;script&gt;/);
});

// --- misconfiguration fails closed ------------------------------------
await check('no SITE_PASSWORD -> 503, nothing served', async () => {
  const saved = process.env.SITE_PASSWORD;
  delete process.env.SITE_PASSWORD;
  const res = await middleware(get('/', session));
  assert.equal(res.status, 503);
  assert.match(await res.text(), /SITE_PASSWORD/);
  process.env.SITE_PASSWORD = saved;
});

await check('changing the password invalidates old sessions', async () => {
  process.env.SITE_PASSWORD = 'a-brand-new-password';
  const res = await middleware(get('/', session));
  assert.equal(res.status, 401);
  process.env.SITE_PASSWORD = 'correct-horse-battery-staple';
});

await check('GET /__gate sends you home rather than 404ing', async () => {
  const res = await middleware(get('/__gate'));
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), '/');
});

console.log(`\n${passed}/17 checks passed`);
