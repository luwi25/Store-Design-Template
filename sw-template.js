const PREFIX='store-design:'+self.registration.scope+':';
const CACHE=PREFIX+'__VERSION__';
const FILES=__FILES__;
const HASHES=__HASHES__;
const scoped=path=>new URL(path,self.registration.scope).href;
const ALLOWED=new Set(FILES.map(scoped));
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  const previous=[];
  for(const name of await caches.keys()){
   if(!name.startsWith(PREFIX)||name===CACHE)continue;
   const old=await caches.open(name),record=await old.match(scoped('__asset-digests'));
   previous.push({cache:old,hashes:record?await record.json():{}});
  }
  // Reuse identical assets locally instead of downloading the whole app again.
  for(let i=0;i<FILES.length;i+=4)await Promise.all(FILES.slice(i,i+4).map(async file=>{
   const immutable=/^(assets\/|defaults\/images\/)[a-f0-9]{64}\./.test(file);
   for(const old of previous){
    if(old.hashes[file]!==HASHES[file]&&!immutable)continue;
    const response=await old.cache.match(scoped(file));
    if(response){await cache.put(scoped(file),response);return;}
   }
   await cache.addAll([scoped(file)]);
  }));
  await cache.put(scoped('__asset-digests'),new Response(JSON.stringify(HASHES)));
  // Activate completed updates without requiring every installed app window to close.
  // Do not reload open editors or touch their IndexedDB projects.
  await self.skipWaiting();
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
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  // defaults/project.json drives the published-catalog revision check -- always go to
  // network for it (like app code) so a slightly-stale installed service worker never
  // serves an old cached catalog. defaults/images/* stay cache-first: they're large,
  // content-hashed by sha256, and genuinely immutable for a given hash.
  const appCode=event.request.mode==='navigate'||/\.(?:js|css)$/.test(url.pathname)||url.pathname.endsWith('/defaults/project.json')||url.pathname.endsWith('/defaults/sales-sync.json');
  if(appCode){
   try{
    const response=await fetch(event.request,{cache:'no-cache'});
    if(response.ok)return response;
   }catch{/* Offline: use the complete installed app. */}
  }
  return await cache.match(key)||fetch(event.request);
 })());
});
