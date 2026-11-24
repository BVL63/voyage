'use strict';
const CACHE='voyage-shell-v062';
const CDN='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.89.0/dist/umd/supabase.js';
const ROOT=self.registration.scope;
const HOME=new URL('index.html',ROOT).href;
const FILES=['manifest.webmanifest','icon-192.png','icon-512.png'].map(x=>new URL(x,ROOT).href);
self.addEventListener('install',e=>e.waitUntil((async()=>{
 const c=await caches.open(CACHE);
 const h=await fetch(HOME,{cache:'reload'});
 if(!h.ok||!(await h.clone().text()).includes('v0.6.2'))throw Error('App shell not published yet');
 await c.put(HOME,h.clone());await c.put(ROOT,h.clone());
 await Promise.allSettled(FILES.map(async x=>{const r=await fetch(x,{cache:'reload'});if(r.ok)await c.put(x,r)}));
 try{const r=await fetch(CDN,{cache:'reload',mode:'cors'});if(r.ok)await c.put(CDN,r)}catch(_){}
 await self.skipWaiting();
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{await self.clients.claim();for(const k of await caches.keys())if(k.startsWith('voyage-shell-')&&k!==CACHE)await caches.delete(k)})()));
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;
 if(req.url===CDN){e.respondWith((async()=>{const c=await caches.open(CACHE);const old=await c.match(CDN);if(old)return old;try{const r=await fetch(req);if(r.ok&&r.type!=='opaque')await c.put(CDN,r.clone());return r}catch(_){return new Response('/* offline */',{headers:{'Content-Type':'application/javascript'}})}})());return}
 const u=new URL(req.url);if(u.origin!==self.location.origin)return;
 const clean=u.origin+u.pathname;
 if(clean===ROOT||clean===HOME||clean===ROOT.slice(0,-1)){e.respondWith((async()=>{const c=await caches.open(CACHE);return await c.match(HOME)||await c.match(ROOT)||fetch(req)})());return}
 if(FILES.includes(clean)){e.respondWith((async()=>{const c=await caches.open(CACHE);return await c.match(clean)||fetch(req)})());}
});
