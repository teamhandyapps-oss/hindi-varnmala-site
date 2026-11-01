// Submit sitemap URLs to IndexNow after deploy.
// Submits only new/changed URLs vs the pre-deploy sitemap (artifact from build job);
// falls back to the full sitemap when no previous sitemap is available.
// Exits non-zero when submission was required but failed - the indexnow job goes red
// (deploy is a separate, already-completed job, so the site is unaffected).
const HOST = 'https://hindivarnmala.com';
const KEY = process.env.INDEXNOW_KEY;
const OLD = process.env.OLD_SITEMAP_PATH || 'old-sitemap.xml';
if (!KEY) { console.error('INDEXNOW_KEY not set'); process.exit(1); }

const res = await fetch(`${HOST}/sitemap.xml`);
if (!res.ok) { console.error(`live sitemap fetch failed: HTTP ${res.status}`); process.exit(1); }
const xml = await res.text();
const cur = new Map([...xml.matchAll(/<loc>(https:\/\/hindivarnmala\.com[^<]+)<\/loc>(?:<lastmod>([^<]*)<\/lastmod>)?/g)].map(m => [m[1], m[2] || '']));

let old = new Map();
try {
  const fs = await import('node:fs');
  const ox = fs.readFileSync(OLD, 'utf8');
  old = new Map([...ox.matchAll(/<loc>(https:\/\/hindivarnmala\.com[^<]+)<\/loc>(?:<lastmod>([^<]*)<\/lastmod>)?/g)].map(m => [m[1], m[2] || '']));
  console.log(`previous sitemap: ${old.size} urls`);
} catch {
  console.log('no previous sitemap available; submitting all urls');
}

const todo = [...cur].filter(([u, lm]) => !old.has(u) || old.get(u) !== lm).map(([u]) => u);
if (old.size && !todo.length) { console.log('no new or changed urls; nothing to submit'); process.exit(0); }

const body = { host: 'hindivarnmala.com', key: KEY, keyLocation: `${HOST}/${KEY}.txt`, urlList: todo };
const r = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) }).catch(e => { console.error(`IndexNow request failed: ${e.message}`); process.exit(1); });
console.log(`IndexNow submitted ${todo.length} urls -> HTTP ${r.status}`);
if (r.status >= 400) { console.error('IndexNow submission rejected'); process.exit(1); }
