const fs=require('fs'),assert=require('assert/strict'),{JSDOM}=require('jsdom');
const mobile=process.argv.includes('--mobile');
const html=fs.readFileSync('public/index.html','utf8');
// Direct browser printing includes the L5290 safe area without changing exports.
assert(html.includes('.landscape-print-page{box-sizing:border-box!important;width:297mm;height:210mm;padding:3mm!important;'));
assert(html.includes('.landscape-print-art{display:block!important;width:100%!important;height:100%!important;'));
assert(html.includes('object-position:center center'));

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
 w.eval([...w.document.querySelectorAll('script')].find(s=>s.textContent.includes('function renderPoster')).textContent.replace('window.flashSaleActions={','window.__visibilityTest={setStoreFilter,getState:()=>state,renderAll,choosePrintPaper,printGeometry,preparePrintPages,printPoster,templateVersion,prepareTemplateVersion2Page,exportTemplateVersion2,stubExport:()=>{exportPosterCanvas=async d=>{window.__dimensions=[d.width,d.height];return document.createElement("canvas")};printQualityPNG=async()=>new Blob(["png"]);printSheetPDF=async(c,p)=>{window.__paper=p;return new Blob(["pdf"])}}};window.flashSaleActions={'));
 await new Promise(r=>setTimeout(r,700));assert.equal(errors.length,0,errors.join('\n'));
 const api=w.__visibilityTest;


 api.setStoreFilter('all');const state=api.getState();state.templateId='kazumi-opon-v2-back';api.renderAll();await new Promise(r=>setTimeout(r,100));
 assert.equal(api.templateVersion().name,'Template Version 2');assert.equal(w.document.getElementById('paperSelect').disabled,true);
 assert.equal(w.document.getElementById('fitSelect').value,'full');assert(w.document.querySelector('.landscape-template'));
 let called=0;w.STORE_ACTIVITY_CONFIG={enabled:true};w.storeActivity={view:()=>{},requestPrint:()=>called++};api.printPoster();assert.equal(called,1,'Version 2 keeps approval routing');assert(!w.document.getElementById('printPaperDialog')?.open);
 api.prepareTemplateVersion2Page(w.document.createElement('img'));assert.equal(w.document.querySelectorAll('.landscape-print-page').length,1);assert.equal(w.document.querySelectorAll('.print-cut-line').length,0);assert(w.document.getElementById('dynamicPageRule').textContent.includes('297mm 210mm'));
 w.dispatchEvent(new w.Event('afterprint'));assert(!w.document.body.classList.contains('printing-landscape'));assert.equal(w.document.getElementById('printSheet').children.length,0);
 api.stubExport();w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};let filename='';w.HTMLAnchorElement.prototype.click=function(){filename=this.download};
 for(const format of ['pdf','png']){await api.exportTemplateVersion2(format);assert.deepEqual(Array.from(w.__dimensions),[3508,2480]);assert(filename.endsWith(' - print-ready.'+format));if(format==='pdf')assert.deepEqual(Array.from(w.__paper),[297,210]);}
 await w.flashSaleActions.exportPNG();assert.deepEqual(Array.from(w.__dimensions),[3508,2480]);assert(!filename.includes('print-ready'));
 assert(!w.document.querySelector('.app').textContent.includes('Template Version 2'));
 state.templateId='home-back';api.renderAll();assert.equal(api.templateVersion().name,'Template Version 1');assert(!w.document.querySelector('.landscape-template'));assert.equal(w.document.getElementById('paperSelect').disabled,false);assert.equal(w.document.getElementById('fitSelect').disabled,false);
 state.poster.paper='a4';state.poster.fit='half';api.preparePrintPages([w.document.createElement('img'),w.document.createElement('img')]);assert.equal(w.document.querySelectorAll('.top-print-placement').length,2);assert.equal(w.document.querySelectorAll('.print-cut-line').length,1);assert(w.document.getElementById('dynamicPageRule').textContent.includes('210mm 297mm'));assert(!w.document.body.classList.contains('printing-landscape'));
 assert.equal(errors.length,0,errors.join('\n'));dom.window.close();console.log('PASS Version 2: one landscape A4 page, PDF/PNG dimensions, approval routing, cleanup and Version 1 fallback.');
})().catch(e=>{console.error(e);process.exit(1)});
