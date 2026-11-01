// Post-deploy: submit changed URLs to IndexNow (api.indexnow.org only).
// Covered set: every sitemap page URL plus every /downloads/*.pdf linked from
// the built pages, so worksheet PDF edits are submitted too. The build job's
// snapshot (old-hashes.json) carries sha256 of the pre-deploy live content and
// of the freshly built bytes for each covered URL. Comparing the two proves
// exactly which URLs changed - independent of Pages propagation - so a deploy
// that changes no covered content submits NOTHING and exits cleanly.
// Fallbacks, always labeled: a missing or legacy snapshot artifact, or any
// URL whose old or new content could not be hashed, submits what cannot be
// proven unchanged - the full covered set when no comparison is possible at
// all. A real content change must never be silently skipped. Exits non-zero
// when a required submission fails; this job runs after deploy, so the site
// deploy is unaffected. INDEXNOW_DRY_RUN=1 logs the urlList without posting.
import { readFileSync } from 'node:fs';
const HOST = 'https://hindivarnmala.com';
const KEY = process.env.INDEXNOW_KEY;
const DRY = process.env.INDEXNOW_DRY_RUN === '1';
const HASHES = process.env.OLD_HASHES_PATH || 'old-hashes.json';
if (!KEY && !DRY) { console.error('INDEXNOW_KEY not set'); process.exit(1); }

let art = null;
try { art = JSON.parse(readFileSync(HASHES, 'utf8')); } catch { /* no artifact */ }
const modern = art && art.build && typeof art.build === 'object' && art.hashes && typeof art.hashes === 'object';

let todo;
if (modern) {
  const old = art.hashes;
  console.log(`snapshot: ${Object.keys(old).length} of ${(art.attempted || []).length} live urls hashed; build map covers ${Object.keys(art.build).length} urls`);
  todo = [];
  for (const [u, h] of Object.entries(art.build)) {
    if (h === null) { todo.push(u); continue; }   // build bytes unreadable: unprovable
    if (!(u in old)) { todo.push(u); continue; }  // new URL, or old content unprovable
    if (old[u] !== h) todo.push(u);               // proven content change
  }
} else {
  // Missing or legacy (plain map) snapshot: no build bytes to compare against.
  // Enumerate the covered set from the live site and submit it all, as before.
  console.log(art ? 'snapshot predates build-hash coverage; submitting full covered set (fallback)' : 'no pre-deploy snapshot; submitting full covered set (fallback)');
  const res = await fetch(`${HOST}/sitemap.xml`).catch(e => ({ ok: false, status: e.message }));
  if (!res.ok) { console.error(`live sitemap fetch failed: ${res.status}`); process.exit(1); }
  const urls = [...(await res.text()).matchAll(/<loc>(https:\/\/hindivarnmala\.com[^<]+)<\/loc>/g)].map(m => m[1]);
  if (!urls.length) { console.error('no urls in live sitemap'); process.exit(1); }
  const pdfUrls = new Set();
  for (const u of urls) {
    try {
      const body = await (await fetch(u)).text();
      for (const m of body.matchAll(/href="(\/downloads\/[^"]+\.pdf)"/g)) pdfUrls.add(HOST + m[1]);
    } catch { /* the set we have is still submitted */ }
  }
  todo = [...urls, ...pdfUrls];
}
if (!todo.length) { console.log('deploy changes no covered content; nothing to submit'); process.exit(0); }

const body = { host: 'hindivarnmala.com', key: KEY || 'dry-run', keyLocation: `${HOST}/${KEY || 'dry-run'}.txt`, urlList: todo };
if (DRY) { console.log(`[dry-run] would submit ${todo.length} urls:`); for (const u of todo) console.log('  ' + u); process.exit(0); }
const r = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) }).catch(e => { console.error(`IndexNow request failed: ${e.message}`); process.exit(1); });
console.log(`IndexNow submitted ${todo.length} urls -> HTTP ${r.status}`);
if (r.status >= 400) { console.error('IndexNow submission rejected'); process.exit(1); }
