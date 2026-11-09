const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
 const scope='https://example.test/app/',events={},stores=new Map(),network=[];let offline=false;
 const key=v=>typeof v==='string'?v:v.url;
 const open=async name=>{if(!stores.has(name)){const data=new Map();stores.set(name,{match:async url=>data.get(key(url))?.clone(),put:async(url,response)=>data.set(key(url),response.clone()),keys:async()=>[...data.keys()].map(url=>({url})),addAll:async urls=>{for(const url of urls)stores.get(name).put(url,await fetcher(url))}})}return stores.get(name)};
 const fetcher=async url=>{url=key(url);if(offline)throw Error('Offline');network.push(url);return new Response('file:'+url)};
 const context={self:{registration:{scope},location:{origin:'https://example.test'},addEventListener:(name,fn)=>events[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}},URL,Set,Response,caches:{open,keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name)},fetch:fetcher};
 vm.runInNewContext(fs.readFileSync('public/sw.js','utf8'),context);
 let pending;events.install({waitUntil:p=>pending=p});await pending;
 assert(!network.some(url=>/\/(vendor|assets|defaults)\//.test(url)));
 const asset=scope+'defaults/images/'+'a'.repeat(64)+'.png';
 async function get(url,mode='cors'){let response;events.fetch({request:{url,method:'GET',mode},respondWith:p=>response=p});assert(response,'Request should be handled');return (await response).text()}
 await get(asset);const before=network.length;offline=true;assert.equal(await get(asset),'file:'+asset);assert.equal(network.length,before);
 offline=false;await get(scope+'vendor/u2netp.onnx');offline=true;assert.equal(await get(scope+'vendor/u2netp.onnx'),'file:'+scope+'vendor/u2netp.onnx');
 offline=false;await get(scope+'defaults/project.json?check=1');offline=true;assert.match(await get(scope+'defaults/project.json?check=2'),/check=1/);
 offline=false;events.message({data:{type:'editor-ready'},waitUntil:p=>pending=p});await pending;
 offline=true;assert.match(await get(scope+'template-import/','navigate'),/template-import\/index.html/);
 const old=await open('store-design:'+scope+':old');await old.put(asset,new Response('old-image'));events.activate({waitUntil:p=>pending=p});await pending;
 assert.equal(await get(asset),'old-image');
 console.log('PASS: essential-only install; requested images/models cached; offline metadata fallback; import navigation; immutable images retained across deployment.');
})().catch(e=>{console.error(e);process.exitCode=1});
