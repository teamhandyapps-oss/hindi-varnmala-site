import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync,spawn} from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import {createHash} from 'node:crypto';
const hostRequest=(url,host)=>new Promise((resolve,reject)=>{http.get(url,{headers:{Host:host}},res=>{res.resume();resolve({status:res.statusCode,headers:{get:name=>res.headers[name]??null}})}).on('error',reject)});
test('default custom domain, educational content and privacy',()=>{execFileSync('node',['build.mjs'],{env:{...process.env,SITE_URL:'',RAILWAY_PUBLIC_DOMAIN:''}});const html=fs.readFileSync('dist/index.html','utf8');assert.match(html,/href="https:\/\/hindivarnmala\.com\/"/);assert.doesNotMatch(html,/Amar Parkash|Gurgaon|ratingValue/);assert.match(fs.readFileSync('dist/privacy/index.html','utf8'),/request logs/);assert.equal(JSON.parse(fs.readFileSync('dist/data.json')).numbers.length,100);assert.deepEqual(JSON.parse(fs.readFileSync('dist/audio-manifest.json')),{});for(const route of ['letters','barakhadi','numbers','worksheets','parents','privacy','support','tracing','stories','gallery'])assert.ok(fs.existsSync(`dist/${route}/index.html`));});
test('config-driven canonical and sitemap',()=>{execFileSync('node',['build.mjs'],{env:{...process.env,SITE_URL:'https://example.com'}});assert.match(fs.readFileSync('dist/index.html','utf8'),/href="https:\/\/example.com\/"/);assert.equal((fs.readFileSync('dist/sitemap.xml','utf8').match(/<loc>/g)||[]).length,19);assert.match(fs.readFileSync('dist/robots.txt','utf8'),/Sitemap: https:\/\/example.com/);execFileSync('node',['build.mjs'],{env:{...process.env,SITE_URL:'',RAILWAY_PUBLIC_DOMAIN:''}})});
test('server routes, MIME, CSP and missing pages',async()=>{const child=spawn('node',['server.mjs'],{env:{...process.env,PORT:'3017'}});try{for(let i=0;i<30;i++){try{await fetch('http://127.0.0.1:3017/health.json');break}catch{await new Promise(r=>setTimeout(r,50))}}const response=await fetch('http://127.0.0.1:3017/letters/');assert.equal(response.status,200);assert.match(response.headers.get('content-security-policy'),/sha256-/);assert.match(response.headers.get('content-type'),/text\/html/);assert.equal((await fetch('http://127.0.0.1:3017/missing/')).status,404);assert.equal((await fetch('http://127.0.0.1:3017/data.json')).status,200);assert.equal((await fetch('http://127.0.0.1:3017/devanagari.ttf')).status,200)}finally{child.kill()}});

test('search pages, PDFs and page-specific schema',()=>{execFileSync('node',['build.mjs'],{env:{...process.env,SITE_URL:'https://example.com'}});for(const r of ['numbers','hindi-varnamala-chart','barakhadi-chart','hindi-varnamala-pdf','swar-vyanjan-chart','worksheets/swar','worksheets/vyanjan','worksheets/numbers']){const h=fs.readFileSync(`dist/${r}/index.html`,'utf8');assert.equal((h.match(/<h1>/g)||[]).length,1);const graph=JSON.parse(h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];assert.ok(graph.find(n=>n['@type']==='BreadcrumbList'));assert.ok(graph.find(n=>n['@type']==='SoftwareApplication'));assert.match(h,/og:image/);}assert.match(fs.readFileSync('dist/gallery/index.html','utf8'),/noindex,follow/);assert.doesNotMatch(fs.readFileSync('dist/sitemap.xml','utf8'),/gallery/);assert.match(fs.readFileSync('dist/sitemap.xml','utf8'),/lastmod/);for(const f of ['hindi-numbers-1-100','hindi-varnamala-chart','hindi-barakhadi-chart','swar-vyanjan-chart','swar-worksheet','vyanjan-worksheet','counting-worksheet'])assert.ok(fs.readFileSync('dist/downloads/'+f+'.pdf').subarray(0,4).toString()==='%PDF');});


test('old and www SITE_URL values migrate to HTTPS apex',()=>{
for(const value of ['', 'https://hindi-varnmala-site-production.up.railway.app','https://www.hindivarnmala.com','http://hindivarnmala.com']){
execFileSync('node',['build.mjs'],{env:{...process.env,SITE_URL:value,RAILWAY_PUBLIC_DOMAIN:'legacy.up.railway.app'}});
for(const file of ['index.html','numbers/index.html','schema.json','sitemap.xml','robots.txt']){
const text=fs.readFileSync('dist/'+file,'utf8');
assert.match(text,/https:\/\/hindivarnmala\.com/);
assert.doesNotMatch(text,/www\.hindivarnmala\.com|hindi-varnmala-site-production\.up\.railway\.app|legacy\.up\.railway\.app/);
}
const h=fs.readFileSync('dist/numbers/index.html','utf8');
assert.match(h,/<meta property="og:url" content="https:\/\/hindivarnmala\.com\/numbers\/"/);
assert.match(h,/"url":"https:\/\/hindivarnmala\.com\/numbers\/"/);
}
});
test('legacy host redirects preserve path and query, except health',async()=>{
const child=spawn('node',['server.mjs'],{env:{...process.env,PORT:'3018'}});
try{
for(let i=0;i<30;i++){try{await fetch('http://127.0.0.1:3018/health.json');break}catch{await new Promise(r=>setTimeout(r,50))}}
for(const host of ['www.hindivarnmala.com','hindi-varnmala-site-production.up.railway.app','WWW.HINDIVARNMALA.COM:443']){
const r=await hostRequest('http://127.0.0.1:3018/numbers/?source=old&word=%E0%A4%85',host);
assert.equal(r.status,301);assert.equal(r.headers.get('location'),'https://hindivarnmala.com/numbers/?source=old&word=%E0%A4%85');
const health=await hostRequest('http://127.0.0.1:3018/health.json?check=1',host);
assert.equal(health.status,200);assert.equal(health.headers.get('location'),null);
}
for(const host of ['hindivarnmala.com','localhost:3018','www.hindivarnmala.com.evil.invalid'])assert.equal((await hostRequest('http://127.0.0.1:3018/',host)).status,200);
}finally{child.kill()}
});

test('GA4 is in every page head with cookie-free consent and truthful privacy',()=>{
execFileSync('node',['build.mjs']);
const pages=[];const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+entry.name;if(entry.isDirectory())walk(p);else if(p.endsWith('.html'))pages.push(p)}};walk('dist');
assert.equal(pages.length,20);
for(const p of pages){const h=fs.readFileSync(p,'utf8'),head=h.match(/<head>([\s\S]*?)<\/head>/)[1];assert.equal((head.match(/https:\/\/www.googletagmanager.com\/gtag\/js\?id=G-0PNPNVTWF6/g)||[]).length,1);assert.match(head,/<script async src=/);assert.match(head,/analytics_storage:'denied'/);assert.match(head,/ad_personalization:'denied'/);assert.match(head,/allow_google_signals:false/);assert.match(head,/gtag\('config','G-0PNPNVTWF6'/);}
const privacy=fs.readFileSync('dist/privacy/index.html','utf8');assert.match(privacy,/Google Analytics measures page visits/);assert.doesNotMatch(privacy,/no user accounts, analytics scripts/);
});
test('CSP allows GA loader and hashes inline setup without unsafe-inline',async()=>{
const child=spawn('node',['server.mjs'],{env:{...process.env,PORT:'3020'}});
try{for(let i=0;i<30;i++){try{await fetch('http://127.0.0.1:3020/health.json');break}catch{await new Promise(r=>setTimeout(r,50))}}
const r=await fetch('http://127.0.0.1:3020/');const h=await r.text();const csp=r.headers.get('content-security-policy');assert.match(csp,/script-src 'self' https:\/\/www.googletagmanager.com/);assert.match(csp,/connect-src 'self' https:\/\/\*.google-analytics.com/);assert.doesNotMatch(csp,/unsafe-inline|unsafe-eval/);
const scripts=[...h.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)];assert.equal(scripts.length,2);for(const m of scripts)assert.ok(csp.includes("'sha256-"+createHash('sha256').update(m[1]).digest('base64')+"'"));
}finally{child.kill()}
});


test('website audio is hidden while implementation stays restorable',async()=>{
execFileSync('node',['build.mjs']);
const pages=[];const walk=dir=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())walk(p);else if(p.endsWith('.html'))pages.push(p)}};walk('dist');
assert.equal(pages.length,20);
for(const file of pages)assert.doesNotMatch(fs.readFileSync(file,'utf8'),/soundcontrols|audio-status|sound-mode|stop-sound|data-story|\baudio\b|\bspeech\b|\brecordings?\b|\blisten\b|\bpronunciation\b/i,file);
const script=fs.readFileSync('dist/app.js','utf8');assert.match(script,/speechSynthesis\.speak/);assert.match(script,/if\(!control\)return/);
const {default:vm}=await import('node:vm');let click,selected=false,playback=0;
const card={dataset:{letter:'अ',word:'अनार'},addEventListener:(type,fn)=>{click=fn},classList:{add:()=>{selected=true},remove:()=>{}}};
vm.runInNewContext(script,{document:{querySelector:()=>null,querySelectorAll:s=>s==='[data-letter]'?[card]:[],visibilityState:'hidden'},window:{addEventListener:()=>{},speechSynthesis:{cancel:()=>{},speak:()=>{playback++}}},sessionStorage:{getItem:()=>null},localStorage:{getItem:()=>null},location:{pathname:'/letters/'},setInterval:()=>{},fetch:()=>{throw Error('Unexpected audio request')},SpeechSynthesisUtterance:function(){playback++},Audio:function(){playback++}});
await click();assert.equal(selected,true);assert.equal(playback,0);
});

test('homepage-only accessible carousel preserves directory destinations',()=>{
 execFileSync('npm',['run','build']);
 const html=fs.readFileSync('dist/index.html','utf8');
 assert.match(html,/<footer class="footer"><section class="fbadges"/);
 assert.equal((html.match(/class="fbadges"/g)||[]).length,1);
 assert.match(html,/>DailyPings<\/a>/);
 assert.doesNotMatch(html,/dailypings\.com\/badge/);
 for(const host of ['neeed.directory','findly.tools','startuptrusted.com','nicklaunches.com','wallof.tools','easydofollow.dev','twelve.tools','dailypings.com'])assert.ok(html.includes('href="https://'+host));
 for(const route of ['letters','numbers','privacy','worksheets','parents'])assert.doesNotMatch(fs.readFileSync(`dist/${route}/index.html`,'utf8'),/class="fbadges"|carousel.js/);
 for(const img of [...html.matchAll(/<img[^>]+src="(\/badges\/[^"]+)"/g)])assert.ok(fs.existsSync('dist'+img[1]));
 assert.match(fs.readFileSync('dist/styles.css','utf8'),/prefers-reduced-motion/);
 assert.match(fs.readFileSync('dist/carousel.js','utf8'),/aria-hidden/);
});
