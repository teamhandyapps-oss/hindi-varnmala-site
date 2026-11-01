// Post-deploy: submit changed URLs to IndexNow (api.indexnow.org only).
// Covered set: every sitemap page URL plus every /downloads/*.pdf linked from
// the live pages, so worksheet PDF edits are submitted too. Change detection
// uses actual deployed content: the build job snapshots a sha256 of each URL
// before deploy; this job hashes the live content after deploy and submits
// only URLs whose content changed or that are new. When change cannot be
// proven (missing snapshot, unfetchable URL, or no detected diff after a
// propagation retry), it submits the FULL covered set as a deliberate
// fallback - a real content change must never be silently skipped.
// Exits non-zero when submission was required but failed; the indexnow job is
// separate from (and runs after) deploy, so the site deploy is unaffected.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const HOST = 'https://hindivarnmala.com';
const KEY = process.env.INDEXNOW_KEY;
const HASHES = process.env.OLD_HASHES_PATH || 'old-hashes.json';
if (!KEY) { console.error('INDEXNOW_KEY not set'); process.exit(1); }

const shaBuf = b => createHash('sha256').update(b).digest('hex');
const res = await fetch(`${HOST}/sitemap.xml`).catch(e => ({ ok: false, status: e.message }));
if (!res.ok) { console.error(`live sitemap fetch failed: ${res.status}`); process.exit(1); }
const urls = [...(await res.text()).matchAll(/<loc>(https:\/\/hindivarnmala\.com[^<]+)<\/loc>/g)].map(m => m[1]);
if (!urls.length) { console.error('no urls in live sitemap'); process.exit(1); }

let old = null;
try { old = JSON.parse(readFileSync(HASHES, 'utf8')); console.log(`snapshot: ${Object.keys(old).length} urls`); }
catch { console.log('no pre-deploy snapshot; submitting full covered set (fallback)'); }

const collect = async () => {
  const todo = [];
  const pdfUrls = new Set();
  for (const u of urls) {
    try {
      const r = await fetch(u);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const body = await r.text();
      for (const m of body.matchAll(/href="(\/downloads\/[^"]+\.pdf)"/g)) pdfUrls.add(HOST + m[1]);
      if (!old || old[u] !== shaBuf(body)) todo.push(u);
    } catch { todo.push(u); } // cannot prove unchanged -> submit
  }
  for (const p of pdfUrls) {
    try {
      const r = await fetch(p);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      if (!old || old[p] !== shaBuf(Buffer.from(await r.arrayBuffer()))) todo.push(p);
    } catch { todo.push(p); } // cannot prove unchanged -> submit
  }
  return { todo, all: [...urls, ...pdfUrls] };
};

let { todo, all } = await collect();
if (!old) todo = all;
if (old && !todo.length) {
  console.log('no content diff detected; waiting 60s for Pages propagation, then re-checking');
  await new Promise(r => setTimeout(r, 60000));
  ({ todo } = await collect());
  if (!todo.length) {
    todo = all;
    console.log('still no diff; submitting full covered set (fallback: propagation lag or no-op edit)');
  }
}

const body = { host: 'hindivarnmala.com', key: KEY, keyLocation: `${HOST}/${KEY}.txt`, urlList: todo };
const r = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) }).catch(e => { console.error(`IndexNow request failed: ${e.message}`); process.exit(1); });
console.log(`IndexNow submitted ${todo.length} urls -> HTTP ${r.status}`);
if (r.status >= 400) { console.error('IndexNow submission rejected'); process.exit(1); }
