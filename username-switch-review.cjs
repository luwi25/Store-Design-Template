const fs=require('fs'),assert=require('assert/strict'),{JSDOM}=require('jsdom');
const mobile=process.argv.includes('--mobile');
const html=fs.readFileSync('public/index.html','utf8');
(async()=>{
 const dom=new JSDOM(html,{url:'https://example.test/',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;const errors=[],draws=[];let saved=null;
 w.console.error=(...args)=>errors.push(args.map(String).join(' '));w.console.warn=()=>{};
 w.structuredClone=structuredClone;w.matchMedia=()=>({matches:!mobile,addEventListener(){}});w.scrollTo=()=>{};w.confirm=()=>true;w.document.fonts={load:async()=>[]};
 w.Image=class{constructor(){this.width=this.naturalWidth=1280;this.height=this.naturalHeight=1924}set src(v){queueMicrotask(()=>this.onload?.())}};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 w.HTMLCanvasElement.prototype.toDataURL=()=> 'data:image/png;base64,YWJj';
 w.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({canvas:this,font:'',measureText:t=>({width:String(t).length*5}),fillText(t){draws.push({text:t,font:this.font})},createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})}, {get:(o,k)=>k in o?o[k]:(()=>{})})};
 const source=JSON.parse(fs.readFileSync('defaults/project.json','utf8')).state;
 // This scenario exercises Home Express Back. A published backup can open any
 // template, so select the scenario explicitly instead of inheriting that choice.
 source.templateId='home-back';
 w.StoreDatabase={load:async()=>structuredClone(source),save:async s=>{saved=JSON.parse(JSON.stringify(s))},preserveLegacy:async()=>{}};
 w.eval([...w.document.querySelectorAll('script')].find(s=>s.textContent.includes('function renderPoster')).textContent.replace('window.flashSaleActions={','window.__visibilityTest={setStoreFilter,getState:()=>state,renderAll};window.flashSaleActions={'));
 await new Promise(r=>setTimeout(r,700));assert.equal(errors.length,0,errors.join('\n'));
 const api=w.__visibilityTest;


 w.eval(fs.readFileSync('store-activity.js','utf8'));
 let loggedIn=null;w.STORE_ACTIVITY_CONFIG={enabled:true};w.StoreActivity.enabled=true;w.StoreActivity.login=async(store,password)=>{assert.equal(password,'test-password');loggedIn=store;return store};
 api.setStoreFilter('all');w.flashSaleActions.openStoreChooser();
 assert.equal(w.document.getElementById('storePasswordGate').hidden,false);assert.equal(w.document.querySelectorAll('#storeChooserDialog [data-store]').length,0);
 w.document.getElementById('storeUsername').value='pesoplus-mambaling';w.document.getElementById('storePassword').value='test-password';w.document.getElementById('storePasswordGate').dispatchEvent(new w.Event('submit',{cancelable:true}));await new Promise(r=>setTimeout(r,100));
 assert.equal(loggedIn,'pesoplus');assert.equal(w.document.getElementById('storeChooserDialog').open,false);assert.equal(w.document.getElementById('storePassword').value,'');
 w.flashSaleActions.openStoreChooser();w.document.getElementById('storePasswordCancel').click();assert.equal(w.document.getElementById('storeChooserDialog').open,false);
 assert.equal(errors.length,0,errors.join('\n'));dom.window.close();console.log('PASS account switching through username form and cancel.');
})().catch(e=>{console.error(e);process.exit(1)});
