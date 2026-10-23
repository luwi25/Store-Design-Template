// Supabase Dashboard -> Edge Functions -> quick-handler -> index.ts.
// No third-party imports. Store passwords stay in Edge Function secrets.
// These are secret NAMES. Enter their password values in Supabase -> Edge Functions -> Secrets.
const roles = {
 'home-express': 'HOME_EXPRESS_PASSWORD',
 pesoplus: 'PESOPLUS_PASSWORD',
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
  async function rpc(action: string, tokenHash = '', data: Record<string, unknown> = {}) {
   const response = await fetch(url + '/rest/v1/rpc/store_monitor_api', {
    method: 'POST', signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json', apikey: key!, Authorization: 'Bearer ' + key },
    body: JSON.stringify({ p_action: action, p_token_hash: tokenHash, p_data: data })
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
  const getRoutes: Record<string, string> = { '/session': 'session', '/requests': 'requests', '/activity': 'activity' };
  const postRoutes: Record<string, string> = { '/logout': 'logout', '/events': 'event', '/requests': 'request_create' };
  if (request.method === 'GET' && getRoutes[path]) {
   const data = Object.fromEntries(parsed.searchParams); data.templateId = data.template || '';
   return reply(await rpc(getRoutes[path], tokenHash, data));
  }
  if (request.method === 'POST' && postRoutes[path]) return reply(await rpc(postRoutes[path], tokenHash, path === '/logout' ? {} : await readBody(request)));
  const route = path.match(/^\/requests\/([a-zA-Z0-9_-]{8,80})(?:\/(decision|print))?$/);
  if (route) {
   if (!route[2] && request.method === 'GET') return reply(await rpc('request_get', tokenHash, { id: route[1] }));
   if (route[2] && request.method === 'POST') {
    const data = await readBody(request);
    return reply(await rpc(route[2], tokenHash, { ...data, eventId: data.id, id: route[1] }));
   }
  }
  throw new HttpError(404, 'Endpoint not found.');
 } catch (error) {
  return reply({ error: error instanceof HttpError ? error.message : 'The store service is unavailable. Please retry.' }, error instanceof HttpError ? error.status : 500);
 }
});
