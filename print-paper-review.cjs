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
 w.eval([...w.document.querySelectorAll('script')].find(s=>s.textContent.includes('function renderPoster')).textContent.replace('window.flashSaleActions={','window.__visibilityTest={setStoreFilter,getState:()=>state,renderAll,choosePrintPaper,printGeometry,preparePrintPages,printPoster};window.flashSaleActions={'));
 await new Promise(r=>setTimeout(r,700));assert.equal(errors.length,0,errors.join('\n'));
 const api=w.__visibilityTest;

 api.setStoreFilter('all');let called=0;
 const before=api.getState().poster.paper;
 api.choosePrintPaper('pdf',()=>called++);
 const dialog=w.document.getElementById('printPaperDialog'),select=w.document.getElementById('outputPaperSize');
 assert(dialog.open);assert.equal(select.value,before);select.value='a4';dialog.querySelector('[data-cancel]').click();assert.equal(called,0);assert.equal(api.getState().poster.paper,before);
 api.choosePrintPaper('pdf',()=>called++);select.value='a4';dialog.querySelector('form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(called,1);assert.equal(api.getState().poster.paper,'a4');
 const g=api.printGeometry();assert.deepEqual(Array.from(g.paper),[210,297]);assert(g.inset>=2.5);assert(g.outerTop>=2.5);assert(g.artWidth*2<297);
 api.preparePrintPages([w.document.createElement('img'),w.document.createElement('img')]);assert(w.document.getElementById('dynamicPageRule').textContent.includes('size:210mm 297mm'));assert.equal(w.document.querySelectorAll('.top-print-placement').length,2);
 w.STORE_ACTIVITY_CONFIG={enabled:true};w.storeActivity={requestPrint:()=>called++};
 api.printPoster();assert(dialog.open);assert.equal(called,1);select.value='letter';dialog.querySelector('form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(called,2,'Printing still passes through approval');assert.deepEqual(Array.from(api.printGeometry().paper),[215.9,279.4]);
 await new Promise(r=>setTimeout(r,400));assert.equal(saved.poster.paper,'letter');assert.equal(errors.length,0,errors.join('\n'));dom.window.close();console.log('PASS: A4/Letter selection, cancel, persistence, print dimensions, two-copy margins and approval routing.');
})().catch(e=>{console.error(e);process.exit(1)});
