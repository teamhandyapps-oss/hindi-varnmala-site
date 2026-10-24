import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
test('Pages-only build keeps routes, files, CSP hashes and custom 404',()=>{
 execFileSync('npm',['run','build:pages']);
 assert.equal(fs.readFileSync('dist/CNAME','utf8'),'hindivarnmala.com\n');assert.ok(fs.existsSync('dist/.nojekyll'));
 const pages=walk('dist').filter(f=>f.endsWith('.html'));assert.equal(pages.length,19);
 for(const f of pages){const h=fs.readFileSync(f,'utf8');assert.match(h,/http-equiv="Content-Security-Policy"/);assert.match(h,/<meta name="referrer"/);assert.doesNotMatch(h,/frame-ancestors/);for(const m of h.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g))assert.ok(h.includes('sha256-'+createHash('sha256').update(m[1]).digest('base64')))}
 assert.match(fs.readFileSync('dist/404.html','utf8'),/noindex,follow/);assert.doesNotMatch(fs.readFileSync('dist/404.html','utf8'),/canonical/);
 assert.equal((fs.readFileSync('dist/sitemap.xml','utf8').match(/<loc>/g)||[]).length,17);
 assert.deepEqual(JSON.parse(fs.readFileSync('dist/audio-manifest.json')),{});
});
