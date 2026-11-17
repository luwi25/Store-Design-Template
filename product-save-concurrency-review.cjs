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
 w.eval([...w.document.querySelectorAll('script')].find(s=>s.textContent.includes('function renderPoster')).textContent.replace('window.flashSaleActions={','window.__visibilityTest={setStoreFilter,getState:()=>state,renderAll,choosePrintPaper,printGeometry,preparePrintPages,printPoster,save,flushDatabaseSave,templateVersion,prepareTemplateVersion2Page,exportTemplateVersion2,stubExport:()=>{exportPosterCanvas=async d=>{window.__dimensions=[d.width,d.height];return document.createElement("canvas")};printQualityPNG=async()=>new Blob(["png"]);printSheetPDF=async(c,p)=>{window.__paper=p;return new Blob(["pdf"])}}};window.flashSaleActions={'));
 await new Promise(r=>setTimeout(r,700));assert.equal(errors.length,0,errors.join('\n'));
 const api=w.__visibilityTest;



 api.setStoreFilter('all');const state=api.getState();state.templateId='alkeia-talamban-v2-back';api.renderAll();await new Promise(r=>setTimeout(r,300));
 let release;const pending=new Promise(r=>release=r);let writes=0;const snapshots=[];
 w.StoreDatabase.save=async value=>{if(++writes===1)await pending;snapshots.push(structuredClone(value))};
 api.save();const background=api.flushDatabaseSave();await new Promise(r=>setTimeout(r,10));
 w.flashSaleActions.openSlot(49);const price=w.document.getElementById('slotOriginalPrice');price.value='123';price.dispatchEvent(new w.Event('input'));w.document.getElementById('saveProductEdit').click();await new Promise(r=>setTimeout(r,20));
 assert(!w.document.getElementById('notice').textContent.includes('Product could not be saved'),'An in-flight autosave must not report product save failure');
 release();await background;await new Promise(r=>setTimeout(r,400));
 assert.equal(writes,2,'The queued product edit is persisted after the earlier snapshot');assert.equal(w.document.getElementById('notice').textContent,'Product saved.');
 const last=snapshots.at(-1),id=last.alkeiaV2Back.slots[49].productId;assert.equal(last.products.find(p=>p.id===id).price,123);
 // Real storage errors must still retain a retryable draft.
 w.StoreDatabase.save=async()=>{throw Error('Storage quota exceeded')};w.flashSaleActions.openSlot(49);const second=w.document.getElementById('slotOriginalPrice');second.value='124';second.dispatchEvent(new w.Event('input'));w.document.getElementById('saveProductEdit').click();await new Promise(r=>setTimeout(r,100));assert(!w.document.getElementById('saveProductEdit').disabled);assert(w.document.getElementById('notice').textContent.includes('Storage quota exceeded'));
 dom.window.close();console.log('PASS concurrent autosave waits for product persistence; storage failures preserve edits and explain the cause.');
})().catch(e=>{console.error(e);process.exit(1)});
