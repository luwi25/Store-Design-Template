const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const {JSDOM}=require('jsdom');
(async()=>{
 const dom=new JSDOM(fs.readFileSync('public/index.html','utf8'),{url:'https://luwi25.github.io/Store-Design-Template/',runScripts:'outside-only'}),w=dom.window;
 w.scrollTo=()=>{};w.matchMedia=()=>({matches:false});let edited;
 w.flashSaleActions={openSlot:index=>edited=index};
 w.document.querySelector('#poster').insertAdjacentHTML('beforeend','<button class="duplex-hit" aria-label="Edit product 1: Cup"></button><button class="duplex-hit" aria-label="Edit product 2: Plate"></button>');
 w.eval(fs.readFileSync('mobile.js','utf8'));
 const nav=w.document.querySelectorAll('.mobile-nav button');assert.equal(nav.length,4);
 nav[2].click();assert.equal(w.document.querySelector('.app').dataset.mobileActive,'products');assert.equal(nav[2].getAttribute('aria-pressed'),'true');
 nav[0].click();const picker=w.document.querySelector('#mobileProductPicker');assert.equal(picker.options.length,3);picker.value='1';picker.dispatchEvent(new w.Event('change'));assert.equal(edited,1);
 w.eval(fs.readFileSync('install-app.js','utf8'));assert.equal(w.document.querySelector('#installApp').textContent,'Install app');
 let prompted=false;const event=new w.Event('beforeinstallprompt',{cancelable:true});event.prompt=async()=>{prompted=true};event.userChoice=Promise.resolve({outcome:'accepted'});w.dispatchEvent(event);w.document.querySelector('#installApp').click();await Promise.resolve();assert(prompted);
 w.dispatchEvent(new w.Event('appinstalled'));assert(w.document.querySelector('#installApp').hidden);dom.window.close();
 const manifest=JSON.parse(fs.readFileSync('public/manifest.webmanifest'));assert.equal(manifest.display,'standalone');assert.equal(manifest.scope,'./');
 for(const icon of manifest.icons){const bytes=fs.readFileSync('public/'+icon.src);assert.equal(bytes.readUInt32BE(16),Number(icon.sizes.split('x')[0]))}
 const events={},scope='https://luwi25.github.io/Store-Design-Template/',stored=new Set();
 const cache={addAll:async urls=>{urls.forEach(url=>{assert(url.startsWith(scope));assert(fs.existsSync('public/'+url.slice(scope.length)));stored.add(url)})},match:async key=>stored.has(key)?{cached:key}:null};
 const context={self:{skipWaiting:async()=>{},registration:{scope},location:{origin:'https://luwi25.github.io'},clients:{claim:async()=>{}},addEventListener:(name,handler)=>events[name]=handler},URL,Set,caches:{open:async()=>cache,keys:async()=>[],delete:async()=>{}},fetch:()=>{throw Error('Offline fetch attempted')}};
 vm.createContext(context);vm.runInContext(fs.readFileSync('public/sw.js','utf8'),context);
 let install;events.install({waitUntil:p=>install=p});await install;assert(stored.has(scope+'vendor/u2netp.onnx'));
 let response;events.fetch({request:{method:'GET',url:scope,mode:'navigate'},respondWith:p=>response=p});assert.equal((await response).cached,scope+'index.html');
 events.fetch({request:{method:'POST',url:scope,mode:'cors'},respondWith:()=>{throw Error('POST intercepted')}});
 console.log('PASS: mobile navigation, product picker, install prompt, standalone manifest/icons, complete offline resources and cached navigation.');
})().catch(e=>{console.error(e);process.exitCode=1});
