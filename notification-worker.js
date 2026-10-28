// Lightweight push worker: activation never waits for offline poster/image downloads.
const APP_SCOPE=new URL('../',self.registration.scope).href;
const scoped=path=>new URL(path,APP_SCOPE).href;
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{}}catch{}
 const requestId=/^[a-zA-Z0-9_-]{8,80}$/.test(data.requestId||'')?data.requestId:'';
 const approved=data.type==='approved';
 event.waitUntil(self.registration.showNotification(approved?'Print request approved':'Print approval requested',{
  body:approved?String(data.template||'Your poster').slice(0,160)+' has been approved. Open the poster and use Print poster.':data.store?String(data.store).slice(0,80)+' · '+String(data.template||'Poster').slice(0,160):'A store is waiting for Admin approval.',
  tag:requestId?'print-request-'+requestId:'print-request',
  icon:scoped('icons/icon-192.png'),data:{requestId}
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const id=event.notification.data?.requestId||'';
 const url=scoped('./')+(/^[a-zA-Z0-9_-]{8,80}$/.test(id)?'?printRequest='+encodeURIComponent(id):'');
 event.waitUntil((async()=>{
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  const client=windows.find(item=>item.url.startsWith(APP_SCOPE));
  if(client){client.postMessage({type:'open-print-request',requestId:id});await client.focus()}
  else await self.clients.openWindow(url);
 })());
});
