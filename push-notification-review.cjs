const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
async function workerReview(file='sw-template.js'){
 const handlers={},shown=[],opened=[];
 const scope='https://example.test/Store-Design-Template/';
 const self={registration:{scope:file==='notification-worker.js'?scope+'notifications/':scope,showNotification:async(...args)=>shown.push(args)},location:{origin:'https://example.test'},addEventListener:(name,fn)=>handlers[name]=fn,clients:{matchAll:async()=>[],openWindow:async url=>opened.push(url)}};
 vm.runInNewContext(fs.readFileSync(file,'utf8').replace('__VERSION__','test').replace('__FILES__','[]').replace('__HASHES__','{}'),{self,URL,Set});
 assert.equal(typeof handlers.push,'function','Web push must be handled by the installed worker');
 let promise;
 handlers.push({data:{json:()=>({requestId:'request-1234',store:'Home Express Basak',template:'Front'})},waitUntil:p=>promise=p});await promise;
 assert.equal(shown.length,1);assert.match(shown[0][1].body,/Home Express Basak/);
 handlers.notificationclick({notification:{data:shown[0][1].data,close(){}},waitUntil:p=>promise=p});await promise;
 assert.equal(opened[0],scope+'?printRequest=request-1234');
 handlers.notificationclick({notification:{data:{requestId:'https://evil.test'},close(){}},waitUntil:p=>promise=p});await promise;
 assert.equal(opened[1],scope,'Untrusted click data must stay within the app');
 handlers.push({data:{json:()=>({requestId:'request-1234',type:'approved',template:'Back'})},waitUntil:p=>promise=p});await promise;
 assert.equal(shown[1][0],'Print request approved');assert.match(shown[1][1].body,/Back has been approved/);
 console.log('Service worker push and safe notification navigation passed');
}
async function serverReview(){
 const {stripTypeScriptTypes}=require('node:module');
 let handler,actor='all',background=[],claims=0,delivered=0;
 const secrets={SUPABASE_URL:'https://db.test',SUPABASE_SERVICE_ROLE_KEY:'private',ALLOWED_ORIGINS:'https://example.test',VAPID_PUBLIC_KEY:'public',VAPID_PRIVATE_KEY:'private',VAPID_SUBJECT:'https://example.test'};
 const subscription={endpoint:'https://fcm.googleapis.com/send/test',keys:{p256dh:'B'.repeat(87),auth:'a'.repeat(22)}};
 let failure=false,claimed=false,expired=false,approvalClaims=0;
 const context={URL,Request,Response,AbortSignal,TextEncoder,TextDecoder,Uint8Array,crypto:require('node:crypto').webcrypto,console,
  Deno:{env:{get:key=>secrets[key]},serve:fn=>handler=fn},EdgeRuntime:{waitUntil:p=>background.push(p)},isIP:require('node:net').isIP,
  webpush:{generateRequestDetails:sub=>({endpoint:sub.endpoint,headers:{},body:'encrypted'})},
  fetch:async(url,options)=>{
   if(url.startsWith('https://fcm.')){delivered++;return new Response('',{status:410})}
   const body=JSON.parse(options.body);let result={ok:true};
   if(body.p_action==='session')result={store:actor};
   if(body.p_action==='request_create')result={id:'request-1234',status:'pending'};
   if(body.p_action==='claim'){claims++;if(failure)throw Error('database offline');result={subscriptions:claimed?[]:[subscription],requestId:'request-1234',store:'home-express',template:'Front'};claimed=true}
   if(body.p_action==='expired')expired=true;
   if(body.p_action==='claim_approval'){approvalClaims++;result={subscriptions:[]}}
   return Response.json(result);
  }};
 const source=fs.readFileSync('store-service/index.ts','utf8').replace(/^import .+;\r?\n/gm,'');
 vm.runInNewContext(stripTypeScriptTypes(source),context);
 const call=(path,body)=>handler(new Request('https://edge.test/functions/v1/quick-handler'+path,{method:body?'POST':'GET',headers:{Origin:'https://example.test',Authorization:'Bearer '+'a'.repeat(64)},...(body?{body:JSON.stringify(body)}:{})}));
 assert.equal((await call('/push/config')).status,200);
 actor='home-express';assert.equal((await call('/push/subscribe',subscription)).status,200);
 actor='all';assert.equal((await call('/push/subscribe',{...subscription,endpoint:'https://127.0.0.1/private'})).status,400);
 assert.equal((await call('/push/subscribe',{...subscription,endpoint:'https://fcm.googleapis.com.evil.test/'})).status,400);
 assert.equal((await call('/push/subscribe',subscription)).status,200);
 actor='home-express';assert.equal((await call('/requests',{id:'request-1234'})).status,200);await Promise.all(background);
 assert.equal(delivered,1);assert.equal(expired,true,'Gone subscriptions are removed');
 await call('/requests',{id:'request-1234'});await Promise.all(background);assert.equal(delivered,1);
 failure=true;assert.equal((await call('/requests',{id:'request-1234'})).status,200);await Promise.all(background);
 assert.equal(claims,3);
 actor='all';await call('/requests/request-1234/decision',{status:'approved'});await Promise.all(background);assert.equal(approvalClaims,1);
 await call('/requests/request-1234/decision',{status:'rejected'});await Promise.all(background);assert.equal(approvalClaims,1,'Rejection does not send approval alert');
 console.log('Edge routes: admin authorization, endpoint validation, expired cleanup and non-blocking delivery passed');
}
async function browserReview(){
 const {JSDOM}=require('jsdom');
 const dom=new JSDOM('<div class="top-actions"><button id="printBtn">Print poster</button></div>',{url:'https://example.test/?printRequest=request-1234',runScripts:'outside-only'}),w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 w.AbortSignal=AbortSignal;w.setInterval=()=>0;Object.defineProperty(w,'isSecureContext',{value:true});
 let prompts=0,enrolled=false,sub=null,unsubscribed=0,mode='all',reviews=0,messageHandler;
 w.Notification={permission:'granted',requestPermission:async()=>{prompts++;return 'granted'}};w.PushManager=function(){};
 const key=Buffer.alloc(65,4).toString('base64url');
 const registration={scope:'https://example.test/notifications/',active:{state:'activated'},pushManager:{getSubscription:async()=>sub,subscribe:async()=>sub={endpoint:'https://fcm.googleapis.com/send/test',options:{},toJSON:()=>({endpoint:sub.endpoint,keys:{p256dh:key,auth:'a'.repeat(22)}}),unsubscribe:async()=>{sub=null;unsubscribed++;return true}}}};
 let registered=false,registrations=0;
 const legacy={active:null,pushManager:{getSubscription:async()=>null}}; // Offline installation has not finished.
 Object.defineProperty(w.navigator,'serviceWorker',{value:{getRegistration:async scope=>scope?(registered?registration:undefined):legacy,register:async url=>{assert.match(url,/notification-worker\.js$/);registered=true;registrations++;return registration},addEventListener:(type,fn)=>{if(type==='message')messageHandler=fn}}});
 w.sessionStorage.setItem('store-service-session',JSON.stringify({store:'all',token:'a'.repeat(64)}));
 w.STORE_ACTIVITY_CONFIG={enabled:true,apiBase:'https://edge.test'};
 w.fetch=async(url,opts)=>{
  let result={ok:true};
  if(url.endsWith('/push/config'))result={configured:true,publicKey:key};
  if(url.endsWith('/push/status'))result={enabled:enrolled};
  if(url.endsWith('/push/subscribe'))enrolled=true;
  if(url.endsWith('/push/unsubscribe'))enrolled=false;
  if(url.includes('/requests?'))result={requests:[]};
  if(url.endsWith('/notifications/count'))result={unread:1};
  if(url.endsWith('/notifications'))result={unread:1,notifications:[{id:'1',request_id:'request-1234',kind:'approved',template_name:'Front',created_at:'2026-10-28T10:00:00Z',read_at:null}]};
  if(url.endsWith('/notifications/read')||url.endsWith('/notifications/read-all'))result={unread:0};
  if(url.endsWith('/requests/request-1234')){reviews++;result={store:'home-express',template_name:'Front',status:mode==='all'?'pending':'approved',can_print:true,expires_at:'2026-10-28T12:00:00Z',preview:'',comment:''}}
  if(url.endsWith('/login'))result={store:JSON.parse(opts.body).store,token:'b'.repeat(64)};
  return {ok:true,json:async()=>result};
 };
 w.eval(fs.readFileSync('store-activity.js','utf8'));
 const app=w.StoreActivity.setup({getState:()=>({products:[]}),getMode:()=>mode,getTemplate:()=>({id:'home-back',name:'Front'}),onExpired(){}});
 app.view();await new Promise(r=>setImmediate(r));assert.equal(reviews,1,'Notification link opens authenticated request');
 assert.equal(prompts,0,'Never auto-prompt');
 w.document.getElementById('storeActivityDashboard').click();await new Promise(r=>setImmediate(r));
 const button=w.document.getElementById('adminPushNotifications');await button.onclick();assert.equal(enrolled,true);assert.equal(prompts,1);assert.equal(button.textContent,'Disable notifications');
 assert.equal(registrations,1,'Notification enrollment must succeed while the offline worker is inactive');
 await button.onclick();assert.equal(enrolled,false);assert.equal(unsubscribed,1);
 await button.onclick();await w.StoreActivity.login('home-express','password');mode='home-express';app.view();
 assert.equal(unsubscribed,2,'Switching to a store stops Admin notifications');assert.equal(w.document.getElementById('storeActivityDashboard').hidden,true);
 const storeButton=w.document.getElementById('storeNotifications');assert.equal(storeButton.hidden,false);storeButton.click();await new Promise(r=>setImmediate(r));
 assert.equal(storeButton.querySelector('.notification-count').textContent,'1');assert.equal(w.document.querySelectorAll('.notification-item.is-unread').length,1);
 await button.onclick();assert.equal(enrolled,true);assert.match(w.document.querySelector('.store-push-settings [role=status]').textContent,/Approval alerts/);
 messageHandler({data:{type:'open-print-request',requestId:'request-1234'}});await new Promise(r=>setImmediate(r));
 const approval=w.document.querySelector('dialog[aria-label="Print request status"]');assert.equal(approval.open,true);assert.match(approval.querySelector('[data-status]').textContent,/Approved until/);
 assert.equal(storeButton.querySelector('.notification-count').hidden,true);
 dom.window.close();console.log('Admin notification controls, opt-in, disable, click review and store switch passed');
}
async function sqlReview(){
 const {PGlite}=require(require('node:path').join(process.env.TEMP,'store-push-check/node_modules/@electric-sql/pglite'));
 const db=new PGlite();await db.exec('create role anon; create role authenticated; create role service_role;');
 await db.exec(fs.readFileSync('store-service/supabase-setup.sql','utf8'));
 await db.exec(fs.readFileSync('store-service/push-notifications.sql','utf8'));
 await db.exec(fs.readFileSync('store-service/push-notifications.sql','utf8'));
 await db.exec(fs.readFileSync('store-service/notification-inbox.sql','utf8'));
 const admin='a'.repeat(64),store='b'.repeat(64);
 await db.query("insert into store_monitor.sessions values ($1,'all',now()+interval '1 hour'),($2,'home-express',now()+interval '1 hour')",[admin,store]);
 const rpc=async(action,token,data={})=>(await db.query('select public.store_push_api($1,$2,$3::jsonb) as data',[action,token,JSON.stringify(data)])).rows[0].data;
 const sub={endpoint:'https://fcm.googleapis.com/test',keys:{p256dh:'B'.repeat(87),auth:'a'.repeat(22)}};
 assert.equal((await rpc('subscribe','',sub)).status,401);
 assert.equal((await rpc('subscribe',admin,sub)).ok,true);
 await db.exec("insert into store_monitor.print_requests(id,store,template_id,template_name,preview) values('request-1234','home-express','home-back','Back','preview')");
 assert.equal((await rpc('claim',admin,{id:'request-1234'})).subscriptions.length,0);
 assert.equal((await rpc('claim',store,{id:'request-1234'})).subscriptions.length,1);
 assert.equal((await rpc('claim',store,{id:'request-1234'})).subscriptions.length,0,'Repeated requests cannot notify twice');
 const storeSub={...sub,endpoint:'https://fcm.googleapis.com/store-device'};
 await rpc('subscribe',store,storeSub);
 const other='c'.repeat(64);await db.query("insert into store_monitor.sessions values ($1,'pesoplus',now()+interval '1 hour')",[other]);
 await rpc('subscribe',other,{...sub,endpoint:'https://fcm.googleapis.com/other-store'});
 assert.equal((await rpc('status',store,{endpoint:sub.endpoint})).enabled,false);
 await rpc('unsubscribe',store,{endpoint:sub.endpoint});
 assert.equal((await rpc('status',admin,{endpoint:sub.endpoint})).enabled,true);
 assert.equal((await rpc('claim_approval',store,{id:'request-1234'})).status,403);
 assert.equal((await rpc('claim_approval',admin,{id:'request-1234'})).subscriptions.length,0,'Pending requests do not send approval alerts');
 await db.exec("update store_monitor.print_requests set status='approved',decided_at=now() where id='request-1234'");
 const approval=await rpc('claim_approval',admin,{id:'request-1234'});
 assert.equal(approval.subscriptions.length,1);assert.equal(approval.subscriptions[0].endpoint,storeSub.endpoint);
 assert.equal((await rpc('claim_approval',admin,{id:'request-1234'})).subscriptions.length,0);
 const inbox=async(action,token,data={})=>(await db.query('select public.store_inbox_api($1,$2,$3::jsonb) as data',[action,token,JSON.stringify(data)])).rows[0].data;
 assert.equal((await inbox('count',store)).unread,1);assert.equal((await inbox('count',admin)).unread,1);
 assert.equal((await inbox('count',other)).unread,0);
 const item=(await inbox('list',store)).notifications[0];
 assert.equal((await inbox('read',other,{id:item.id})).status,404);
 assert.equal((await inbox('read',store,{id:item.id})).unread,0);
 await db.exec(fs.readFileSync('store-service/notification-inbox.sql','utf8'));
 assert.equal((await inbox('count',store)).unread,0,'Read state persists after rerunning migration');
 assert.equal((await inbox('list',store)).notifications.length,1,'No duplicates from repeated approval or migration');
 assert.equal((await inbox('read_all',admin)).unread,0);
 await rpc('unsubscribe',admin,{endpoint:sub.endpoint});assert.equal((await rpc('status',admin,{endpoint:sub.endpoint})).enabled,false);
 await db.close();console.log('PostgreSQL migration rerun, account-bound enrollment, store isolation and approval deduplication passed');
}
(async()=>{await workerReview();await workerReview('notification-worker.js');await serverReview();await browserReview();if(process.argv.includes('--sql'))await sqlReview()})().catch(e=>{console.error(e);process.exitCode=1});
