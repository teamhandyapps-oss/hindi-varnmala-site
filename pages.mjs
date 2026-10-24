// Optional GitHub Pages post-build. Not part of the Railway build.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
fs.writeFileSync('dist/CNAME','hindivarnmala.com\n');
fs.writeFileSync('dist/.nojekyll','');
fs.writeFileSync('dist/404.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Page not found | Hindi Varnmala</title><link rel="stylesheet" href="/styles.css"></head><body><main class="wrap"><section class="hero"><div><h1>Page not found</h1><p>This page may have moved. Keep learning with Hindi Varnmala.</p><p><a href="/">Go to the homepage</a> · <a href="/letters/">Hindi letters</a> · <a href="/worksheets/">Worksheets</a></p></div></section></main></body></html>');
for(const f of walk('dist').filter(f=>f.endsWith('.html'))){
 let h=fs.readFileSync(f,'utf8');
 const hashes=[...h.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>"'sha256-"+createHash('sha256').update(m[1]).digest('base64')+"'").join(' ');
 const csp=`default-src 'self'; script-src 'self' https://www.googletagmanager.com ${hashes}; style-src 'self'; font-src 'self'; img-src 'self' data: https://*.google-analytics.com https://www.googletagmanager.com; media-src 'self'; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com; base-uri 'none'; form-action 'none'`;
 const meta='<meta http-equiv="Content-Security-Policy" content="'+csp+'"><meta name="referrer" content="strict-origin-when-cross-origin">';
 h=h.replace(/<meta charset="utf-8"\s*\/?>/i,m=>m+meta);
 if(!h.includes('http-equiv="Content-Security-Policy"'))throw Error('Missing charset insertion point: '+f);
 fs.writeFileSync(f,h);
}
console.log('Pages artifacts prepared; no deployment performed');
