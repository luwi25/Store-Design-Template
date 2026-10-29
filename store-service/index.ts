// Supabase Dashboard -> Edge Functions -> quick-handler -> index.ts.
// Store passwords and VAPID private key stay in Edge Function secrets.
import { isIP } from 'node:net';
import webpush from 'npm:web-push@3.6.7';
declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };

function pushSubscription(value: any) {
 let endpoint: URL;
 try { endpoint = new URL(value?.endpoint); } catch { throw new HttpError(400, 'Invalid notification endpoint.'); }
 const host = endpoint.hostname;
 const allowed = host === 'fcm.googleapis.com' || host === 'updates.push.services.mozilla.com' ||
  host === 'web.push.apple.com' || host.endsWith('.push.apple.com') || host.endsWith('.notify.windows.com');
 if (endpoint.protocol !== 'https:' || endpoint.port || endpoint.username || endpoint.password || endpoint.hash || !allowed || endpoint.href.length > 2048)
  throw new HttpError(400, 'This notification provider is not supported.');
 const keys=value?.keys;
 if (!/^[A-Za-z0-9_-]{87}$/.test(keys?.p256dh || '') || !/^[A-Za-z0-9_-]{22}$/.test(keys?.auth || ''))
  throw new HttpError(400, 'Invalid notification keys.');
 return { endpoint:endpoint.href, keys:{p256dh:keys.p256dh,auth:keys.auth} };
}

// Connection metadata only, never an authorization or rate-limit identity.
// Prefer the hosted gateway's single client address. Do not guess a client
// from an ambiguous forwarded chain or accept an address from the login body.
function actionAddress(request: Request) {
 const gateway = request.headers.get('cf-connecting-ip')?.trim() || '';
 if (isIP(gateway)) return { ipAddress: gateway, ipSource: 'cf-connecting-ip' };
 const forwarded = request.headers.get('x-forwarded-for')?.trim() || '';
 if (!forwarded.includes(',') && isIP(forwarded)) return { ipAddress: forwarded, ipSource: 'x-forwarded-for' };
 return { ipAddress: null, ipSource: null };
}
// These are secret NAMES. Enter their password values in Supabase -> Edge Functions -> Secrets.
const roles = {
 'home-express': 'HOME_EXPRESS_BASAK_PASSWORD',
 pesoplus: 'PESOPLUS_PASSWORD',
 'alkeia-talamban': 'ALKEIA_TALAMBAN_PASSWORD',
 all: 'ADMIN_PASSWORD'
};
class HttpError extends Error {
 status: number;
 constructor(status: number, message: string) { super(message); this.status = status; }
}
const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), b => b.toString(16).padStart(2, '0')).join('');
async function readBody(request: Request) {
 if (Number(request.headers.get('content-length')) > 1000000) throw new HttpError(413, 'Request too large.');
 const reader = request.body?.getReader();
 if (!reader) throw new HttpError(400, 'A request body is required.');
 const chunks: Uint8Array[] = []; let size = 0;
 for (;;) {
  const { done, value } = await reader.read(); if (done) break;
  size += value.byteLength;
  if (size > 1000000) { await reader.cancel(); throw new HttpError(413, 'Request too large.'); }
  chunks.push(value);
 }
 const bytes = new Uint8Array(size); let offset = 0;
 for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
 try {
  const value = JSON.parse(new TextDecoder().decode(bytes));
  if (!value || Array.isArray(value) || typeof value !== 'object') throw Error();
  return value;
 } catch { throw new HttpError(400, 'Invalid JSON request.'); }
}
Deno.serve(async (request: Request) => {
 const origin = request.headers.get('origin') || '';
 const origins = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s => s.trim()).filter(Boolean);
 const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin', 'X-Content-Type-Options': 'nosniff' };
 if (origins.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
 const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers });
 try {
  if (!origin || !origins.includes(origin)) throw new HttpError(403, 'This website is not allowed to use the store service.');
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization', 'Access-Control-Max-Age': '600' } });
  const url = Deno.env.get('SUPABASE_URL'), key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new HttpError(503, 'The store database is not configured.');
  async function rpc(action: string, tokenHash = '', data: Record<string, unknown> = {}, push = false, inbox = false) {
   const response = await fetch(url + '/rest/v1/rpc/'+(inbox?'store_inbox_api':push?'store_push_api':'store_monitor_api'), {
    method: 'POST', signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json', apikey: key!, Authorization: 'Bearer ' + key },
    body: JSON.stringify({ p_action: action, p_token_hash: tokenHash, p_data: push?data:{ ...data, ...actionAddress(request) } })
   });
   if (!response.ok) throw new HttpError(503, 'The shared database is unavailable. Check the SQL setup and retry.');
   const result = await response.json();
   if (result.error) throw new HttpError(Number(result.status) || 500, result.error);
   return result;
  }
  const parsed = new URL(request.url);
  const path = parsed.pathname.replace(/^\/(?:functions\/v1\/)?(?:store-activity|quick-handler)(?=\/|$)/, '').replace(/\/$/, '') || '/';
  if (path === '/login' && request.method === 'POST') {
   const data = await readBody(request);
   if (!Object.hasOwn(roles, data.store) || typeof data.password !== 'string' || data.password.length > 256) throw new HttpError(400, 'Choose a store and enter its password.');
   const secret = Deno.env.get(roles[data.store as keyof typeof roles]);
   if (!secret || secret.length < 12) throw new HttpError(503, 'The store password has not been configured.');
   // Per-store limit cannot be bypassed by forging forwarded IP headers.
   const limit = await rpc('login_limit', '', { key: 'store:' + data.store });
   if (!limit.allowed) throw new HttpError(429, 'Too many sign-in attempts for this store. Try again in 15 minutes.');
   const a = await hash(data.password), b = await hash(secret); let difference = 0;
   for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
   if (difference) throw new HttpError(401, 'Incorrect password.');
   const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
   const result = await rpc('session_create', await hash(token), { store: data.store });
   return reply({ ...result, token });
  }
  const token = request.headers.get('authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if (!token) throw new HttpError(401, 'Please sign in to your store again.');
  const tokenHash = await hash(token);
  if(path==='/notifications'&&request.method==='GET')return reply(await rpc('list',tokenHash,Object.fromEntries(parsed.searchParams),false,true));
  if(path==='/notifications/count'&&request.method==='GET')return reply(await rpc('count',tokenHash,{},false,true));
  if(path==='/notifications/read'&&request.method==='POST')return reply(await rpc('read',tokenHash,await readBody(request),false,true));
  if(path==='/notifications/read-all'&&request.method==='POST')return reply(await rpc('read_all',tokenHash,{},false,true));
  const publicKey=Deno.env.get('VAPID_PUBLIC_KEY')||'',privateKey=Deno.env.get('VAPID_PRIVATE_KEY')||'';
  const subject=Deno.env.get('VAPID_SUBJECT')||'';
  const pushReady=Boolean(publicKey&&privateKey&&/^(mailto:|https:\/\/)/.test(subject));
  const larkWebhook=Deno.env.get('LARK_WEBHOOK_URL')||'';
  const larkReady=(()=>{try{const u=new URL(larkWebhook);return u.protocol==='https:'&&(u.hostname==='open.larksuite.com'||u.hostname==='open.feishu.cn');}catch{return false;}})();
  const ADMIN_URL='https://luwi25.github.io/Store-Design-Template/';
  function larkPrintCard(kind:'requested'|'print_initiated',storeName:string,template:string){
   const title=kind==='requested'?'New Print Request':'Printing Started';
   const time=new Intl.DateTimeFormat('en-PH',{timeZone:'Asia/Manila',dateStyle:'medium',timeStyle:'short'}).format(new Date());
   return{msg_type:'interactive',card:{config:{wide_screen_mode:true},
    header:{title:{tag:'plain_text',content:`\u{1F5A8}️ ${title}`},template:kind==='requested'?'blue':'green'},
    elements:[
     {tag:'div',fields:[
      {is_short:false,text:{tag:'lark_md',content:`**Store**\n${storeName}`}},
      {is_short:false,text:{tag:'lark_md',content:`**Template**\n${template||'-'}`}},
      {is_short:false,text:{tag:'lark_md',content:`**Time**\n${time}`}}
     ]},
     {tag:'hr'},
     {tag:'action',actions:[{tag:'button',text:{tag:'plain_text',content:'Open Admin'},type:'primary',url:ADMIN_URL}]}
    ]}};
  }
  async function notifyLark(card:unknown){
   try{
    const response=await fetch(larkWebhook,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(card),signal:AbortSignal.timeout(10000)});
    if(!response.ok)console.warn('Lark notification failed',response.status);
    await response.body?.cancel();
   }catch{console.warn('Lark notification failed');}
  }
  if(path.startsWith('/push/') && ['GET','POST'].includes(request.method)){
   const actor=await rpc('session',tokenHash);
   if(!Object.hasOwn(roles,actor.store))throw new HttpError(403,'Store sign-in is required.');
   if(path==='/push/config'&&request.method==='GET')return reply({configured:pushReady,publicKey:pushReady?publicKey:null});
   if(request.method==='POST'&&['/push/subscribe','/push/unsubscribe','/push/status'].includes(path)){
    const body=await readBody(request);
    if(path==='/push/subscribe'&&!pushReady)throw new HttpError(503,'Notifications need setup in Supabase.');
    const data=path==='/push/subscribe'?pushSubscription(body):{endpoint:String(body.endpoint||'').slice(0,2048)};
    return reply(await rpc(path.slice(6),tokenHash,data,true));
   }
  }
  async function notifyPrintAccount(id: string, approval = false, eventId?: string){
   try{
    const batch=await rpc(eventId?'claim_print':approval?'claim_approval':'claim',tokenHash,{id,...(eventId?{eventId}:{})},true);
    const names:Record<string,string>={'home-express':'Home Express Basak',pesoplus:'Pesoplus Mambaling','alkeia-talamban':'Alkeia Talamban'};
    const storeName=names[batch.store]||'Store';
    const payload=JSON.stringify({requestId:batch.requestId,store:storeName,template:batch.template,type:eventId?'print_initiated':approval?'approved':'requested',eventId:batch.eventId});
    // Admin-facing only (new request / store started printing); approvals notify the store, not Lark.
    if(!approval&&larkReady&&batch.requestId)await notifyLark(larkPrintCard(eventId?'print_initiated':'requested',storeName,batch.template));
    const rows=batch.subscriptions||[];
    for(let i=0;i<rows.length;i+=5)await Promise.all(rows.slice(i,i+5).map(async (raw:any)=>{
     try{
      const subscription=pushSubscription(raw);
      // Use the library's encryption/signing with fetch for a hard total timeout and no redirects.
      const details=webpush.generateRequestDetails(subscription,payload,{TTL:3600,urgency:'high',vapidDetails:{subject,publicKey,privateKey}});
      const response=await fetch(details.endpoint,{method:'POST',headers:details.headers,body:details.body,redirect:'error',signal:AbortSignal.timeout(10000)});
      if(response.status===404||response.status===410)await rpc('expired','',{endpoint:raw.endpoint,subscription:raw},true);
      else if(!response.ok)console.warn('Print push delivery failed',response.status);
      await response.body?.cancel();
     }catch{console.warn('Print push delivery failed');}
    }));
   }catch{console.warn('Print push unavailable; print request remains saved.');}
  }
  const getRoutes: Record<string, string> = { '/session': 'session', '/requests': 'requests', '/activity': 'activity' };
  const postRoutes: Record<string, string> = { '/logout': 'logout', '/events': 'event', '/requests': 'request_create' };
  if (request.method === 'GET' && getRoutes[path]) {
   const data = Object.fromEntries(parsed.searchParams); data.templateId = data.template || '';
   return reply(await rpc(getRoutes[path], tokenHash, data));
  }
  if (request.method === 'POST' && postRoutes[path]) {
   const result=await rpc(postRoutes[path],tokenHash,path==='/logout'?{}:await readBody(request));
   if(path==='/requests'&&result.id&&(pushReady||larkReady))EdgeRuntime.waitUntil(notifyPrintAccount(result.id));
   return reply(result);
  }
  const route = path.match(/^\/requests\/([a-zA-Z0-9_-]{8,80})(?:\/(decision|print))?$/);
  if (route) {
   if (!route[2] && request.method === 'GET') return reply(await rpc('request_get', tokenHash, { id: route[1] }));
   if (route[2] && request.method === 'POST') {
    const data = await readBody(request);
    const result=await rpc(route[2], tokenHash, { ...data, eventId: data.id, id: route[1] });
    if(route[2]==='decision'&&data.status==='approved'&&pushReady)EdgeRuntime.waitUntil(notifyPrintAccount(route[1],true));
    if(route[2]==='print'&&result.ok&&typeof data.id==='string'&&(pushReady||larkReady))EdgeRuntime.waitUntil(notifyPrintAccount(route[1],false,data.id));
    return reply(result);
   }
  }
  throw new HttpError(404, 'Endpoint not found.');
 } catch (error) {
  return reply({ error: error instanceof HttpError ? error.message : 'The store service is unavailable. Please retry.' }, error instanceof HttpError ? error.status : 500);
 }
});
