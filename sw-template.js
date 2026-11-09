const PREFIX='store-design:'+self.registration.scope+':';
const CACHE=PREFIX+'__VERSION__';
const FILES=__FILES__;
const ESSENTIAL=__ESSENTIAL__;
const OPTIONAL=__OPTIONAL__;
const RUNTIME=PREFIX+'runtime';
const HASHES=__HASHES__;
const scoped=path=>new URL(path,self.registration.scope).href;
const ALLOWED=new Set(FILES.map(scoped));
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{}}catch{}
 const requestId=/^[a-zA-Z0-9_-]{8,80}$/.test(data.requestId||'')?data.requestId:'';
 const approved=data.type==='approved',initiated=data.type==='print_initiated';
 const eventId=/^[a-zA-Z0-9:_-]{8,120}$/.test(data.eventId||'')?data.eventId:requestId;
 event.waitUntil(self.registration.showNotification(initiated?'Store started printing':approved?'Print request approved':'Print approval requested',{
  body:initiated?String(data.store||'Store').slice(0,80)+' started printing '+String(data.template||'Poster').slice(0,160)+'.':approved?String(data.template||'Your poster').slice(0,160)+' has been approved. Open the poster and use Print poster.':data.store?String(data.store).slice(0,80)+' · '+String(data.template||'Poster').slice(0,160):'A store is waiting for Admin approval.',
  tag:initiated?'print-initiated-'+eventId:requestId?'print-request-'+requestId:'print-request',
  icon:scoped('icons/icon-192.png'),data:{requestId}
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const id=event.notification.data?.requestId||'';
 const url=scoped('./')+(/^[a-zA-Z0-9_-]{8,80}$/.test(id)?'?printRequest='+encodeURIComponent(id):'');
 event.waitUntil((async()=>{
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  const client=windows.find(item=>item.url.startsWith(self.registration.scope));
  if(client){client.postMessage({type:'open-print-request',requestId:id});await client.focus()}
  else await self.clients.openWindow(url);
 })());
});
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
  for(let i=0;i<ESSENTIAL.length;i+=4)await Promise.all(ESSENTIAL.slice(i,i+4).map(async file=>{
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
  // Open editors decide when to refresh safely; never modify IndexedDB projects.
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  // Keep already-used immutable artwork and model files across deployments.
  const runtime=await caches.open(RUNTIME);
  for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE&&name!==RUNTIME){
   const old=await caches.open(name);
   for(const request of await old.keys())if(/\/(?:assets|defaults\/images)\/[a-f0-9]{64}\./.test(request.url))await runtime.put(request,await old.match(request));
   await caches.delete(name);
  }
  await self.clients.claim();
 })());
});
let warming=null;
self.addEventListener('message',event=>{
 if(event.data?.type!=='editor-ready')return;
 if(!warming)warming=(async()=>{
  const cache=await caches.open(CACHE);
  // Optional lightweight screens/icons are warmed serially after editing can begin.
  for(const file of OPTIONAL){try{if(!await cache.match(scoped(file)))await cache.addAll([scoped(file)])}catch{/* Retry when requested. */}}
 })();
 event.waitUntil(warming);
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 const navigation=event.request.mode==='navigate';
 const clean=new URL(url);clean.search='';
 const key=navigation?(url.pathname.endsWith('/template-import/')?scoped('template-import/index.html'):ALLOWED.has(clean.href)?clean.href:scoped('index.html')):clean.href;
 const immutable=/\/(?:assets|defaults\/images)\/[a-f0-9]{64}\.(png|jpg|webp|svg)$/.test(url.pathname);
 if(!ALLOWED.has(key)&&!immutable)return;
 event.respondWith((async()=>{
  const cache=await caches.open(immutable?RUNTIME:CACHE);
  // defaults/project.json drives the published-catalog revision check -- always go to
  // network for it (like app code) so a slightly-stale installed service worker never
  // serves an old cached catalog. defaults/images/* stay cache-first: they're large,
  // content-hashed by sha256, and genuinely immutable for a given hash.
  const appCode=event.request.mode==='navigate'||/\.(?:js|css)$/.test(url.pathname)||url.pathname.endsWith('/defaults/project.json');
  if(appCode){
   try{
    const response=await fetch(event.request,{cache:'no-cache'});
    if(response.ok){try{await cache.put(key,response.clone())}catch{/* Storage may be full; keep the online response usable. */}return response;}
   }catch{/* Offline: use the complete installed app. */}
  }
  const saved=await cache.match(key);if(saved)return saved;
  const response=await fetch(event.request);
  if(response.ok)try{await cache.put(key,response.clone())}catch{/* Caching is optional for an online request. */}
  return response;
 })());
});
