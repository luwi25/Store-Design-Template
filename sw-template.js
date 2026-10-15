const PREFIX='store-design:'+self.registration.scope+':';
const CACHE=PREFIX+'__VERSION__';
const FILES=__FILES__;
const scoped=path=>new URL(path,self.registration.scope).href;
const ALLOWED=new Set(FILES.map(scoped));
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  // Avoid downloading all large reference images at once on phones.
  for(let i=0;i<FILES.length;i+=3)await cache.addAll(FILES.slice(i,i+3).map(scoped));
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 const key=event.request.mode==='navigate'?scoped('index.html'):url.href;
 if(!ALLOWED.has(key))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);return await cache.match(key)||fetch(event.request)})());
});
