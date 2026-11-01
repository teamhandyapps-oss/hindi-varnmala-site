// Pre-deploy: hash the currently deployed content of every sitemap URL.
// Runs in the build job (live site is still the previous deploy). Tolerant:
// any failure just leaves no artifact, and the indexnow job falls back to
// submitting the full sitemap.
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
const HOST = 'https://hindivarnmala.com';
const res = await fetch(`${HOST}/sitemap.xml`).catch(() => null);
if (!res || !res.ok) { console.log('sitemap fetch failed; no snapshot'); process.exit(0); }
const urls = [...(await res.text()).matchAll(/<loc>(https:\/\/hindivarnmala\.com[^<]+)<\/loc>/g)].map(m => m[1]);
const hashes = {};
for (const u of urls) {
  try {
    const r = await fetch(u);
    if (r.ok) hashes[u] = createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex');
  } catch { /* skip: missing entry means "cannot prove unchanged" */ }
}
writeFileSync('old-hashes.json', JSON.stringify(hashes));
console.log(`snapshotted ${Object.keys(hashes).length} of ${urls.length} urls`);
