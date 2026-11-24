'use strict';
const CACHE='voyage-shell-v060';
const CDN="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.89.0/dist/umd/supabase.js";
const ROOT=self.registration.scope;
const HOME=new URL('index.html',ROOT).href;
const FILES=['index.html','manifest.webmanifest','icon-192.png','icon-512.png'].map(x=>new URL(x,ROOT).href);
self.addEventListener('install',e=>e.waitUntil((async()=>{const c=await caches.open(CACHE);await c.addAll(FILES.map(x=>new Request(x,{cache:'reload'})));const lib=await fetch(CDN,{cache:'reload',mode:'cors'});if(!lib.ok)throw Error('Cannot cache library');await c.put(CDN,lib);await self.skipWaiting()})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('voyage-shell-')&&k!==CACHE)await caches.delete(k);await self.clients.claim()})()));
self.addEventListener('fetch',e=>{
const req=e.request;if(req.method!=='GET')return;
if(req.url===CDN){e.respondWith((async()=>{const c=await caches.open(CACHE);return await c.match(CDN)||fetch(req)})());return}
const u=new URL(req.url);if(u.origin!==self.location.origin||!u.href.startsWith(ROOT))return;
if(req.mode==='navigate'){e.respondWith((async()=>{try{const res=await fetch(req);if(res.ok)return res;}catch(_){}const c=await caches.open(CACHE);return await c.match(HOME)||Response.error()})());return}
if(FILES.includes(u.href))e.respondWith((async()=>{const c=await caches.open(CACHE);return await c.match(req)||fetch(req)})());
});
