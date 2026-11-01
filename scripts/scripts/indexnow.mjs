// Submit all live sitemap URLs to IndexNow after deploy. Never fails the build.
const HOST = 'https://hindivarnmala.com';
const KEY = process.env.INDEXNOW_KEY;
if (!KEY) { console.log('INDEXNOW_KEY not set; skipping'); process.exit(0); }
const res = await fetch(`${HOST}/sitemap.xml`);
if (!res.ok) { console.log(`sitemap fetch ${res.status}; skipping`); process.exit(0); }
const xml = await res.text();
const urls = [...xml.matchAll(/<loc>(https:\/\/hindivarnmala\.com[^<]+)<\/loc>/g)].map(m => m[1]);
if (!urls.length) { console.log('no urls found; skipping'); process.exit(0); }
const body = { host: 'hindivarnmala.com', key: KEY, keyLocation: `${HOST}/${KEY}.txt`, urlList: urls };
const r = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) });
console.log(`IndexNow submitted ${urls.length} urls -> HTTP ${r.status}`);
